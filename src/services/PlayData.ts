import Dexie, { Table } from "dexie";


export interface ConfigData {
    id?: number;
    name: string;
    config: string;
}
export interface GamePadConfig {
    axisX: number;
    axisY: number;
    buttons: number[];
}

class GameSaveData extends Dexie {
    private config: Table<ConfigData>;

    public constructor() {
        super('TetrisData');

        this.version(1).stores({
            configData: '++id, name, config'
        });
        this.config = this.table('configData');
    }

    public async setConfig(name: string, config: any): Promise<boolean> {
        const dt = await this.config.get({ name: name });
        if (dt) {
            await this.config.update(dt.id, { name: name, config: JSON.stringify(config) });
        } else {
            await this.config.put({ name: name, config: JSON.stringify(config) });
        }
        return true;
    }
    public async getConfig(name: string): Promise<any> {
        const dt = await this.config.get({ name: name });
        if (dt) {
            return JSON.parse(dt.config);
        }
        return null;
    }
}

export const saveData = new GameSaveData();

/**
 * ボタンの種類
 */
export enum ButtonType {
    Left,
    Right,
    Drop,
    HardDrop,
    Hold,
    Start,
    LeftTurn,
    RightTurn
}

export interface StickData {
    isLeft(cancel?: boolean): boolean;
    isRight(cancel?: boolean): boolean;
    isHardDrop(cancel?: boolean): boolean;
    isDrop(cancel?: boolean): boolean;
    isLeftTurn(cancel?: boolean): boolean;
    isRightTurn(cancel?: boolean): boolean;
    isHold(cancel?: boolean): boolean;
    isStart(cancel?: boolean): boolean;
    getButtonName(type: ButtonType): string;

    checkButton(): void;
}

export interface IPlay {
    stepFrame(gl: WebGL2RenderingContext, stick: StickData): IPlay;
}



const defaultGamePadConfig: { [id: string]: GamePadConfig } = {
    "default": {
        axisX: 0,
        axisY: 1,
        buttons: [14, 15, 13, 12, 0, 1, 3, 9]
    },
    "Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 09cc)": {
        axisX: 0,
        axisY: 1,
        buttons: [14, 15, 13, 12, 0, 1, 3, 9]
    }
};


/**
 * キーボード
 */
export class KeyboardStick implements StickData {
    private keyFlag: number;
    /**
     * 押しっぱなし検出
     */
    private keepFlag: number;
    private keyConfig: { [key: string]: ButtonType; } = {
        'ArrowUp': ButtonType.HardDrop,
        'ArrowLeft': ButtonType.Left,
        'ArrowRight': ButtonType.Right,
        'ArrowDown': ButtonType.Drop,
        'Space': ButtonType.Hold,
        'KeyZ': ButtonType.LeftTurn,
        'KeyX': ButtonType.RightTurn,
        'Enter': ButtonType.Start
    };
    private buttonName: { [type: number]: string; } = {};

    public constructor() {
        this.keyFlag = 0;
        this.keepFlag = 0;
        saveData.getConfig('keyConfig').then(res => {
            if (res) {
                this.keyConfig = res;
                this.buttonName = {};
            }
        });
    }
    isHardDrop(cancel?: boolean | undefined): boolean {
        return this.isButtonDown(ButtonType.HardDrop, cancel);
    }
    isDrop(cancel?: boolean | undefined): boolean {
        return this.isButtonDown(ButtonType.Drop, cancel);
    }
    isLeftTurn(cancel?: boolean | undefined): boolean {
        return this.isButtonDown(ButtonType.LeftTurn, cancel);
    }
    isRightTurn(cancel?: boolean | undefined): boolean {
        return this.isButtonDown(ButtonType.RightTurn, cancel);
    }
    isHold(cancel?: boolean | undefined): boolean {
        return this.isButtonDown(ButtonType.Hold, cancel);
    }
    isStart(cancel?: boolean | undefined): boolean {
        return this.isButtonDown(ButtonType.Start, cancel);
    }
    public processEvent(event: KeyboardEvent): boolean {
        let flag = 0;
        if (event.key in this.keyConfig) {
            flag = 1 << this.keyConfig[event.key];
        } else if (event.code in this.keyConfig) {
            flag = 1 << this.keyConfig[event.code];
        }
        if (flag) {
            if (event.type === 'keydown') {
                this.keyFlag |= flag;
            } else if (event.type === 'keyup') {
                this.keyFlag &= ~flag;
                this.keepFlag &= ~flag;
            }
            return true;
        }
        return false;
    }
    protected isButtonDown(type: ButtonType, cancel?: boolean): boolean {
        let ret = (this.keyFlag & (1 << type) & ~this.keepFlag) > 0;
        if (cancel && ret) {
            this.keepFlag |= (1 << type);
        }
        return ret;
    }

    isLeft(cancel?: boolean): boolean {
        return this.isButtonDown(ButtonType.Left, cancel);
    }
    isRight(cancel?: boolean): boolean {
        return this.isButtonDown(ButtonType.Right, cancel);
    }
    getButtonName(type: ButtonType): string {
        if (!this.buttonName[type]) {
            for (let key in this.keyConfig) {
                if (this.keyConfig[key] === type) {
                    let text = "";
                    for (let i = 0; i < key.length; i++) {
                        const ch = key[i];
                        const big = ch.toUpperCase();
                        if (i > 0 && ch === big) {
                            text += ' ';
                        }
                        text += big;
                    }
                    this.buttonName[type] = text;
                    break;
                }
            }
        }
        return this.buttonName[type];
    }

    public getKeyConfig(): { [key: string]: ButtonType; } {
        return Object.assign({}, this.keyConfig);
    }
    public setKeyConfig(config: { [key: string]: ButtonType; }): void {
        this.keyConfig = config;
        this.buttonName = {};
        saveData.setConfig("keyConfig", config).then();
    }
    checkButton(): void {
    }
}

export class GamepadStick extends KeyboardStick {
    private padIndex: number;
    private lastState: boolean[];
    private pushed: boolean[];
    private axis: boolean[];
    private padConfig: GamePadConfig;
    private id: string;
    public pushListener?: (button: number) => void;

    public constructor(gamePad: Gamepad) {
        super();
        this.id = gamePad.id;
        this.axis = [false, false, false, false];
        this.padIndex = gamePad.index;
        this.lastState = [];
        this.pushed = [];
        for (let i = 0; i < gamePad.buttons.length; i++) {
            this.lastState.push(false);
            this.pushed.push(false);
        }
        this.padConfig = defaultGamePadConfig[gamePad.id] || defaultGamePadConfig['default'];
        saveData.getConfig(gamePad.id).then(res => {
            if (res) {
                this.padConfig = res;
            }
        });
    }

    protected isButtonDown(type: ButtonType, cancel?: boolean | undefined): boolean {
        //console.log(this.gamePad.axes);
        const index = this.padConfig.buttons[type];
        if (this.pushed[index]) {
            if (cancel) {
                this.pushed[index] = false;
            }
            return true;
        } else if (type === ButtonType.LeftTurn || type === ButtonType.RightTurn) {
            if (this.padConfig.buttons.length > type + 2) {
                const index2 = this.padConfig.buttons[type + 2];
                if (this.pushed[index2]) {
                    if (cancel) {
                        this.pushed[index2] = false;
                    }
                    return true;
                }
            }
        }
        return super.isButtonDown(type, cancel);
    }

    checkButton(): void {
        const pad = navigator.getGamepads()[this.padIndex];
        if (pad) {
            let tmpaxis = [false, false, false, false];
            if (this.padConfig.axisX < pad.axes.length) {
                let val = pad.axes[this.padConfig.axisX];
                if (val < -0.5) {
                    tmpaxis[ButtonType.Left] = true;
                } else if (val > 0.5) {
                    tmpaxis[ButtonType.Right] = true;
                }
            }
            if (this.padConfig.axisY < pad.axes.length) {
                let val = pad.axes[this.padConfig.axisY];
                if (val < -0.8) {
                    tmpaxis[ButtonType.HardDrop] = true;
                } else if (val > 0.5) {
                    tmpaxis[ButtonType.Drop] = true;
                }
            }
            for (let i = 0; i < tmpaxis.length; i++) {
                if (tmpaxis[i] !== this.axis[i]) {
                    // 変わった
                    this.axis[i] = tmpaxis[i];
                    this.pushed[this.padConfig.buttons[i]] = tmpaxis[i];
                }
            }
            for (let i = 0; i < pad.buttons.length; i++) {
                if (this.lastState[i] !== pad.buttons[i].pressed) {
                    this.lastState[i] = pad.buttons[i].pressed;
                    this.pushed[i] = this.lastState[i];
                    if (this.lastState[i] && this.pushListener) {
                        this.pushListener(i);
                    }
                }
            }
        }
    }

    public getPadConfig(): GamePadConfig {
        return Object.assign({}, this.padConfig);
    }
    public setPadConfig(config: GamePadConfig): void {
        this.padConfig = config;
        saveData.setConfig(this.id, config).then();
    }
    public resetPad(): void {
        for (let i = 0; i < this.pushed.length; i++) {
            this.pushed[i] = false;
        }
    }
}