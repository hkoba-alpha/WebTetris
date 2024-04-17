import { ButtonType } from "./PlayData";

/**
 * 1G落下するまでのスケール
 */
export const GRAVIDY_SCALE = 65536;

export interface Tetrimino {
    index?: number;
    /**
     * パターン
     * 16真数4桁で表現
     */
    pattern: number[];
    /**
     * SRSの回転補正s
     */
    srs: {
        right: number[][];
        left: number[][];
    }
}
export const tetriminoData: { [type: string]: Tetrimino } = {
    'I': {
        pattern: [0x0f00, 0x2222, 0x00f0, 0x4444],
        srs: {
            right: [
                [-2, 0, 1, 0, -2, -1, 1, 2],
                [-1, 0, 2, 0, -1, 2, 2, -1],
                [2, 0, -1, 0, 2, 1, -1, -2],
                [1, 0, -2, 0, 1, -2, -2, 1]
            ],
            left: [
                [-1, 0, 2, 0, -1, 2, 2, -1],
                [2, 0, -1, 0, 2, 1, -1, -2],
                [1, 0, -2, 0, 1, -2, -2, 1],
                [1, -2, 0, 1, 0, -2, -1, 1, 2]
            ]
        }
    },
    'O': {
        pattern: [0x0660, 0x0660, 0x0660, 0x0660],
        srs: {
            right: [[], [], [], []],
            left: [[], [], [], []]
        }
    },
    'S': {
        pattern: [0x06c0, 0x0462, 0x006c, 0x08c4],
        srs: {
            right: [
                [-1, 0, -1, 1, 0, 0, -2, -1, -2],
                [1, 0, 1, -1, 0, 2, 1, 2],
                [1, 0, 1, 1, 0, -2, 1, -2],
                [-1, 0, -1, -1, 0, 2, -1, 2]
            ],
            left: [
                [1, 0, 1, 1, 0, -2, 1, -2],
                [1, 0, 1, -1, 0, 2, 1, 2],
                [-1, 0, -1, 1, 0, -2, -1, -2],
                [-1, 0, -1, -1, 0, 2, -1, 2]
            ]
        }
    },
    'Z': {
        pattern: [0x0c60, 0x0264, 0x00c6, 0x04c8],
        srs: {
            right: [
                [-1, 0, -1, 1, 0, 0, -2, -1, -2],
                [1, 0, 1, -1, 0, 2, 1, 2],
                [1, 0, 1, 1, 0, -2, 1, -2],
                [-1, 0, -1, -1, 0, 2, -1, 2]
            ],
            left: [
                [1, 0, 1, 1, 0, -2, 1, -2],
                [1, 0, 1, -1, 0, 2, 1, 2],
                [-1, 0, -1, 1, 0, -2, -1, -2],
                [-1, 0, -1, -1, 0, 2, -1, 2]
            ]
        }
    },
    'J': {
        pattern: [0x08e0, 0x0644, 0x00e2, 0x044c],
        srs: {
            right: [
                [-1, 0, -1, 1, 0, 0, -2, -1, -2],
                [1, 0, 1, -1, 0, 2, 1, 2],
                [1, 0, 1, 1, 0, -2, 1, -2],
                [-1, 0, -1, -1, 0, 2, -1, 2]
            ],
            left: [
                [1, 0, 1, 1, 0, -2, 1, -2],
                [1, 0, 1, -1, 0, 2, 1, 2],
                [-1, 0, -1, 1, 0, -2, -1, -2],
                [-1, 0, -1, -1, 0, 2, -1, 2]
            ]
        }
    },
    'L': {
        pattern: [0x02e0, 0x0446, 0x00e8, 0x0c44],
        srs: {
            right: [
                [-1, 0, -1, 1, 0, 0, -2, -1, -2],
                [1, 0, 1, -1, 0, 2, 1, 2],
                [1, 0, 1, 1, 0, -2, 1, -2],
                [-1, 0, -1, -1, 0, 2, -1, 2]
            ],
            left: [
                [1, 0, 1, 1, 0, -2, 1, -2],
                [1, 0, 1, -1, 0, 2, 1, 2],
                [-1, 0, -1, 1, 0, -2, -1, -2],
                [-1, 0, -1, -1, 0, 2, -1, 2]
            ]
        }
    },
    'T': {
        pattern: [0x04e0, 0x0464, 0x00e4, 0x04c4],
        srs: {
            right: [
                [-1, 0, -1, 1, 0, /*0, -2,*/ -1, -2],
                [1, 0, 1, -1, 0, 2, 1, 2],
                [1, 0, /*1, 1,*/ 0, -2, 1, -2],
                [-1, 0, -1, -1, 0, 2, -1, 2]
            ],
            left: [
                [1, 0, 1, 1, /*0, -2,*/ 1, -2],
                [1, 0, 1, -1, 0, 2, 1, 2],
                [-1, 0, /*-1, 1,*/ 0, -2, -1, -2],
                [-1, 0, -1, -1, 0, 2, -1, 2]
            ]
        }
    }
}
export const minoColorPattern = [
    [
        [0.7, 0.7, 0.7],
        // IOSZJLT
        [0, 1, 1],
        [1, 1, 0],
        [0, 1, 0],
        [1, 0, 0],
        [0.2, 0.2, 1],
        [1, 0.7, 0],
        [1, 0, 1]
    ]
];

export interface PlayConfig {
    /** 左右長押しで移動し始めるフレーム数 */
    das: number;
    /** 左右長押しで連続移動するフレーム数 */
    repeatSpeed: number;
    /** 落下速度 */
    gravidy: number;
    /** 地面についてからの遊び時間 */
    lock: number;
    /** ラインが消える際の消え始めるまでの待ち時間 */
    lineWait: number;
    /** ラインが消えない時に、次のミノが落ち出すまでの時間 */
    are: number;
    /** ラインが消えた後に、次のミノが落ち出すまでの時間 */
    lineAre: number;
    /** ブロックが消えているときのアニメーション時間 */
    lineClear: number;
    /** 遊び時間中の回転によるリセットの上限 */
    resetLimit: number;
    /** ゴーストブロックの表示 */
    ghost: boolean;
    /** ブロックを置いてから、何回のミノが登場したら見えなくなるか(0-15)。0だと見え続ける */
    invisibleCount: number;
}

/**
 * ネクストブロックを取るための
 */
export interface INextMino {
    /**
     * 次のテトリミノを返却する
     * @param num 0から始まる通し番号
     * @returns "ITOSZJL"のどれかの文字
     */
    nextMino(num: number): string;
}

/**
 * ボタン操作のデータ
 */
export class ButtonData {
    private moveButton: number = 0;
    private moveResult: number = 0;
    private turnButton: number = 0;
    private turnResult: number = 0;
    private dropButton: number = 0;
    private dropResult: number = 0;
    private holdButton: boolean = false;

    /**
     * タッチ操作のデータ
     */
    private touchData = {
        move: 0,
        turn: 0,
        drop: 0,
        hard: false,
        hold: false
    };

    // 0.3秒
    private das: number = 18;

    // 0.5秒で端から端まで
    private speed: number = 3;

    public resetTouch(flag = { move: true, turn: true, drop: true, hard: true, hold: true }): void {
        if (flag.move) {
            this.touchData.move = 0;
        }
        if (flag.turn) {
            this.touchData.turn = 0;
        }
        if (flag.drop) {
            this.touchData.drop = 0;
        }
        if (flag.hard) {
            this.touchData.hard = false;
        }
        if (flag.hold) {
            this.touchData.hold = false;
        }
    }
    public touchMove(add: number): void {
        this.touchData.move += add;
    }
    public touchTurn(add: number): void {
        this.touchData.turn += add;
    }
    public touchDrop(add: number): void {
        this.touchData.drop += add;
        this.touchData.hard = false;
    }
    public touchHard(): void {
        this.touchData.hard = true;
        this.touchData.drop = 0;
    }
    public touchHold(): void {
        this.touchData.hold = true;
    }

    public setDas(das: number): void {
        this.das = das;
    }
    public setRepeatSpeed(speed: number): void {
        this.speed = speed;
    }

    public isRight(): boolean {
        if (this.touchData.move > 0) {
            this.touchData.move--;
            return true;
        }
        if (this.moveButton > 0 && this.moveResult < this.moveButton) {
            // 0.3秒のインターバル、0.5秒で端から端まで
            if (this.moveResult < this.das) {
                //this.moveResult = Math.max(18, this.moveButton + 3);
                this.moveResult = Math.max(this.das, this.moveButton + this.speed);
            } else {
                //this.moveResult += 3;
                this.moveResult++;
            }
            return true;
        }
        return false;
    }
    public isLeft(): boolean {
        if (this.touchData.move < 0) {
            this.touchData.move++;
            return true;
        }
        if (this.moveButton < 0 && this.moveResult > this.moveButton) {
            // 0.3秒のインターバル、0.5秒で端から端まで
            if (this.moveResult > -this.das) {
                //this.moveResult = Math.min(-18, this.moveButton - 3);
                this.moveResult = Math.min(-this.das, this.moveButton - this.speed);
            } else {
                //this.moveResult -= 3;
                this.moveResult--;
            }
            return true;
        }
        return false;
    }
    public isRightTurn(): boolean {
        if (this.touchData.turn > 0) {
            this.touchData.turn--;
            return true;
        }
        if (this.turnButton > 0 && this.turnResult <= 0) {
            this.turnResult = 1;
            return true;
        }
        return false;
    }
    public isLeftTurn(): boolean {
        if (this.touchData.turn < 0) {
            this.touchData.turn++;
            return true;
        }
        if (this.turnButton < 0 && this.turnResult >= 0) {
            this.turnResult = -1;
            return true;
        }
        return false;
    }
    public isHardDrop(): boolean {
        if (this.touchData.hard) {
            return true;
        }
        if (this.dropButton > 0 && this.dropResult <= 0) {
            this.dropResult = 1;
            return true;
        }
        return false;
    }
    public isSoftDrop(): boolean {
        if (this.touchData.drop > 0) {
            this.touchData.drop--;
            return true;
        }
        if (this.dropButton < 0 /*&& this.dropResult >= 0*/) {
            this.dropResult = -1;
            return true;
        }
        return false;
    }
    public isHold(): boolean {
        if (this.touchData.hold) {
            this.touchData.hold = false;
            return true;
        }
        if (this.holdButton) {
            this.holdButton = false;
            return true;
        }
        return false;
    }

    public stepFrame(num: number = 1): void {
        if (this.moveButton < 0) {
            this.moveButton -= num;
        } else if (this.moveButton > 0) {
            this.moveButton += num;
        }
    }

    public push(btn: ButtonType): void {
        switch (btn) {
            case ButtonType.HardDrop:
                this.dropButton = 1;
                this.dropResult = 0;
                break;
            case ButtonType.Drop:
                this.dropButton = -1;
                this.dropResult = 0;
                break;
            case ButtonType.Right:
                if (this.moveButton <= 0) {
                    this.moveButton = 1;
                    this.moveResult = 0;
                }
                break;
            case ButtonType.Left:
                if (this.moveButton >= 0) {
                    this.moveButton = -1;
                    this.moveResult = 0;
                }
                break;
            case ButtonType.RightTurn:
                if (this.turnButton <= 0) {
                    this.turnButton = 1;
                    this.turnResult = 0;
                }
                break;
            case ButtonType.LeftTurn:
                if (this.turnButton >= 0) {
                    this.turnButton = -1;
                    this.turnResult = 0;
                }
                break;
            case ButtonType.Hold:
                this.holdButton = true;
                break;
        }
    }
    public release(btn: ButtonType): void {
        switch (btn) {
            case ButtonType.HardDrop:
                if (this.dropButton > 0) {
                    this.dropButton = 0;
                }
                break;
            case ButtonType.Drop:
                if (this.dropButton < 0) {
                    this.dropButton = 0;
                }
                break;
            case ButtonType.Right:
                if (this.moveButton > 0) {
                    this.moveButton = 0;
                }
                break;
            case ButtonType.Left:
                if (this.moveButton < 0) {
                    this.moveButton = 0;
                }
                break;
            case ButtonType.RightTurn:
                if (this.turnButton > 0) {
                    this.turnButton = 0;
                }
                break;
            case ButtonType.LeftTurn:
                if (this.turnButton < 0) {
                    this.turnButton = 0;
                }
                break;
            case ButtonType.Hold:
                this.holdButton = false;
                break;
        }

    }
}


// TGMっぽいコンフィグ
export type TgmConfig = {
    level: number;
    nextLevel: number;
    /** 背景色 */
    bg?: number[][];
    config: {
        /** 落下速度 */
        gravidy?: number;
        /** 地面についてからの遊び時間 */
        lock?: number;
        /** ラインが消えないときの次のミノが落ち出すまでのフレーム */
        are?: number;
        /** 消えた後に、次のミノが落ち出すまでの時間 */
        lineAre?: number;
        /** ブロックが消えているときのアニメーション時間 */
        lineClear?: number;
        /** 遊び時間中の回転によるリセットの上限 */
        resetLimit?: number;
        /** ゴーストブロックの表示 */
        ghost?: boolean;
        /** ブロックを置いてから、何回のミノが登場したら見えなくなるか(0-15)。0だと見え続ける */
        invisibleCount?: number;
        /** 横移動の溜めフレーム数 */
        das?: number;
    };
}[];

/**
 * 標準的なコンフィグ
 */
export let normalTgmConfig: TgmConfig = [
    {
        level: 0,
        nextLevel: 100,
        config: {
            are: 27,
            lineAre: 27,
            das: 16,
            lock: 30,
            lineClear: 40,
            gravidy: 1024
        },
        bg: [[32, 32, 128], [64, 64, 192], [16, 16, 96], [48, 48, 160]]
    },
    {
        level: 30,
        nextLevel: 100,
        config: {
            gravidy: 1536
        }
    },
    {
        level: 35,
        nextLevel: 100,
        config: {
            gravidy: 2048
        }
    },
    {
        level: 40,
        nextLevel: 100,
        config: {
            gravidy: 2560
        }
    },
    {
        level: 50,
        nextLevel: 100,
        config: {
            gravidy: 3072
        }
    },
    {
        level: 60,
        nextLevel: 100,
        config: {
            gravidy: 4096
        }
    },
    {
        level: 70,
        nextLevel: 100,
        config: {
            gravidy: 8192
        }
    },
    {
        level: 80,
        nextLevel: 100,
        config: {
            gravidy: 12288
        }
    },
    {
        level: 90,
        nextLevel: 100,
        config: {
            gravidy: 16384
        }
    },
    {
        level: 100,
        nextLevel: 200,
        config: {
            gravidy: 20480
        }
    },
    {
        level: 120,
        nextLevel: 200,
        config: {
            gravidy: 24576
        }
    },
    {
        level: 140,
        nextLevel: 200,
        config: {
            gravidy: 28672
        }
    },
    {
        level: 160,
        nextLevel: 200,
        config: {
            gravidy: 32768
        }
    },
    {
        level: 170,
        nextLevel: 200,
        config: {
            gravidy: 36864
        }
    },
    {
        level: 200,
        nextLevel: 300,
        config: {
            gravidy: 1024
        }
    },
    {
        level: 230,
        nextLevel: 300,
        config: {
            gravidy: 8192
        }
    },
    {
        level: 233,
        nextLevel: 300,
        config: {
            gravidy: 24576
        }
    },
    {
        level: 236,
        nextLevel: 300,
        config: {
            gravidy: 32768
        }
    },
    {
        level: 239,
        nextLevel: 300,
        config: {
            gravidy: 40960
        }
    },
    {
        level: 243,
        nextLevel: 300,
        config: {
            gravidy: 49152
        }
    },
    {
        level: 247,
        nextLevel: 300,
        config: {
            gravidy: 57344
        }
    },
    {
        level: 251,
        nextLevel: 300,
        config: {
            gravidy: 65536
        }
    },
    {
        level: 300,
        nextLevel: 400,
        config: {
            gravidy: 131072
        }
    },
    {
        level: 330,
        nextLevel: 400,
        config: {
            gravidy: 196608
        }
    },
    {
        level: 360,
        nextLevel: 400,
        config: {
            gravidy: 262144
        }
    },
    {
        level: 400,
        nextLevel: 500,
        config: {
            gravidy: 327680
        }
    },
    {
        level: 420,
        nextLevel: 500,
        config: {
            gravidy: 262144
        }
    },
    {
        level: 450,
        nextLevel: 500,
        config: {
            gravidy: 196608
        }
    },
    {
        level: 500,
        nextLevel: 600,
        config: {
            gravidy: 1310720,
            das: 10,
            lineClear: 25
        }
    },
    {
        level: 600,
        nextLevel: 700,
        config: {
            lineAre: 18,
            lineClear: 16
        }
    },
    {
        level: 700,
        nextLevel: 800,
        config: {
            are: 18,
            lineAre: 14,
            lineClear: 12
        }
    },
    {
        level: 800,
        nextLevel: 900,
        config: {
            are: 14,
            lineAre: 8,
            lineClear: 6
        }
    },
    {
        level: 900,
        nextLevel: 1000,
        config: {
            das: 8,
            lock: 17
        }
    },
    {
        level: 1000,
        nextLevel: 1100,
        config: {
            are: 8
        }
    },
    {
        level: 1100,
        nextLevel: 1200,
        config: {
            are: 7,
            lineAre: 7,
            lock: 15
        }
    },
    {
        level: 1200,
        nextLevel: 1300,
        config: {
            are: 6,
            lineAre: 6
        }
    }
];

export let hardTgmConfig: TgmConfig = [
    {
        level: 0,
        nextLevel: 100,
        config: {
            are: 12,
            lineAre: 8,
            das: 10,
            lock: 18,
            lineClear: 6,
            gravidy: 1310720
        },
        bg: [[32, 32, 128], [64, 64, 192], [16, 16, 96], [48, 48, 160]]
    },
    {
        level: 100,
        nextLevel: 200,
        config: {
            lineAre: 7,
            das: 8,
            lineClear: 5
        }
    },
    {
        level: 200,
        nextLevel: 300,
        config: {
            lineAre: 6,
            lock: 17,
            lineClear: 4
        }
    },
    {
        level: 300,
        nextLevel: 400,
        config: {
            are: 6,
            lock: 15
        }
    },
    {
        level: 400,
        nextLevel: 500,
        config: {

        }
    },
    {
        level: 500,
        nextLevel: 600,
        config: {
            lineAre: 5,
            das: 6,
            lock: 13,
            lineClear: 3
        }
    },
    {
        level: 600,
        nextLevel: 700,
        config: {
            lock: 12
        }
    },
    {
        level: 700,
        nextLevel: 800,
        config: {
        }
    },
    {
        level: 800,
        nextLevel: 900,
        config: {
        }
    },
    {
        level: 900,
        nextLevel: 1000,
        config: {
        }
    },
    {
        level: 1000,
        nextLevel: 1100,
        config: {
        }
    },
    {
        level: 1100,
        nextLevel: 1200,
        config: {
            lock: 10
        }
    },
    {
        level: 1200,
        nextLevel: 1300,
        config: {
            lock: 8
        }
    },
];

export class TgmPlayListener implements ITetrisListener, INextMino {
    public level: number;
    public nextLevel: number;
    private lastConfig: PlayConfig;
    private nextBg?: number[][];

    // 最後の４つ
    private lastMinos = "SZSZ";

    private configIndex = 0;

    constructor(private config: TgmConfig) {
        this.lastConfig = {
            das: 18,
            repeatSpeed: 1,
            gravidy: 2,
            ghost: true,
            lineClear: 50,
            invisibleCount: 0,
            lineAre: 30,
            are: 30,
            resetLimit: 15,
            lineWait: 0,
            lock: 30
        };
        this.level = 0;
        this.nextLevel = 0;
        this.checkConfig();
    }
    nextMino(num: number): string {
        // 過去４つを覚えておいて、それ以外が出るまで６回抽選、それでも出なければそのまま
        // 最初に Z S O は出ない
        let ix = "I";
        for (let i = 0; i < 7; i++) {
            ix = "ISZOTLJ".charAt(Math.floor(Math.random() * 7));
            if (!this.lastMinos.includes(ix) && (num > 0 || ix !== "O")) {
                break;
            }
        }
        this.lastMinos = this.lastMinos.substring(1) + ix;
        return ix;
    }

    getNextMino(): INextMino {
        return this;
    }

    private checkConfig(): void {
        if (this.configIndex < this.config.length) {
            if (this.level >= this.config[this.configIndex].level) {
                const cf = this.config[this.configIndex];
                this.configIndex++;
                this.lastConfig = Object.assign({}, this.lastConfig, cf.config);
                this.nextLevel = cf.nextLevel;
                if (cf.bg) {
                    this.nextBg = cf.bg;
                }
                return;
            }
        } else if (this.level > this.nextLevel) {
            // 見つからない
            this.level = this.nextLevel;
        }
    }

    public getBgColor(): number[][] | undefined {
        let ret = this.nextBg;
        this.nextBg = undefined;
        return ret;
    }

    onHold(): void {
    }
    onDrop(num: number): void {
    }
    onAttach(pos: number[], delLines: number[]): void {
        if (this.level < this.nextLevel - 1 || delLines.length > 0) {
            this.level += delLines.length + 1;
            if (delLines.length >= 3) {
                this.level++;
                if (delLines.length >= 4) {
                    this.level++;
                }
            }
        }
        this.checkConfig();
    }
    onNext(config: PlayConfig): PlayConfig {
        return this.lastConfig;
    }
}


export interface ITetrisListener {
    /** ホールドした */
    onHold(): void;

    /**
     * 操作で落下させた
     * @param num 落下させたライン数
     */
    onDrop(num: number): void;

    /**
     * ミノがくっついてラインが消えた
     * @param pos 置いた座標
     * @param delLines 消えたライン
     */
    onAttach(pos: number[], delLines: number[]): void;

    /**
     * 次のミノが落ちてくる際に、必要であればconfigを変更する
     * @param config 
     */
    onNext(config: PlayConfig): PlayConfig;

    getNextMino?(): INextMino;

    getTetrimino?(): { [ch: string]: Tetrimino };

    /**
     * 移動した
     * @param before  移動前
     * @param after 移動後
     * @param type Left, Right, Drop, LeftTurn, RightTurn, Hold
     */
    onMove?(before: { index: number, pos: number[] }, after: { index: number, pos: number[] }, type: ButtonType): void;
}

/**
 * 描画ルーチン
 */
export interface ITetrisDrawer {
    /**
     * 扱うシェーダを返却する
     */
    getShaders(): { vertex: string; fragment: string };
    /**
     * プログラムを初期化する
     * @param gl 
     * @param program 
     */
    initProgram(gl: WebGL2RenderingContext, program: WebGLProgram): void;
    /**
     * 描画する
     * @param gl 
     * @param minoTex
     * @param data 
     * @param num 前回描画から進んだフレーム数
     */
    draw(gl: WebGL2RenderingContext, minoTex: WebGLTexture, data: PlayData, num: number): void;
}

/**
 * 一時的にプレイを中断して処理を埋め込む
 */
export interface ITetrisInsertPaly {
    /**
     * 処理の継続
     * @param playData 
     * @returns true: 続く, false: 終わる
     */
    onInsertFrame(playData: PlayData): boolean;
}


export class BoxNextMino implements INextMino {
    private cacheMino: string[] = [];

    nextMino(num: number): string {
        if (this.cacheMino.length < 1) {
            let minos = ["O", "I", "T", "S", "Z", "J", "L"];
            while (minos.length > 1) {
                let ix = Math.floor(Math.random() * minos.length);
                this.cacheMino.push(minos.splice(ix, 1)[0]);
            }
            this.cacheMino.push(minos[0]);
        }
        return this.cacheMino.splice(0, 1)[0];
    }
}

export class PlayData {
    /**
     * ブロックデータ
     * 0:ブロックなし
     * baaa aZZZ
     * b: ブロックあり
     * aaaa: 透明度、10=そのまま、10未満=半透明、11以上=光る
     */
    private blockData: Uint8Array;
    private holdMino?: Tetrimino;
    private nextMino: Tetrimino[] = [];
    private curMino: {
        x: number;
        y: number;
        rotate: number;
        mino: Tetrimino;
        /** 自由落下用 */
        dropCount: number;
        /** 地面についてからの遊びの時間 */
        touchCount: number;
        /** リセットした回数 */
        resetCount: number;
        hold: boolean;
        block: number[][];
        lastPos?: number[];
        lastGhost?: number[];
    } = {
            dropCount: 0,
            mino: tetriminoData['I'],
            resetCount: 0,
            rotate: 0,
            touchCount: 0,
            x: 3,
            y: 20,
            hold: false,
            block: [],
            lastGhost: undefined,
            lastPos: undefined
        };
    private config: PlayConfig;
    /**
     * モード
     * 0: Next待ち
     * 1: 操作中
     * 2: 遊び時間中
     * 3: ブロックが消える直前
     * 4: ブロックが消えている最中
     */
    private mode: number;
    /**
     * mode=0,3,4でのカウンタ
     */
    private modeCount: number;
    /**
     * 消えるライン
     */
    private delLines: number[] = [];

    private nextMinoProc: INextMino;

    private tetrimino: { [ch: string]: Tetrimino };

    /**
     * テトリミノの登場回数
     */
    private minoCount = 0;

    private insertPlay?: ITetrisInsertPaly;

    private overFlag = false;

    constructor(private button: ButtonData, private listener: ITetrisListener) {
        this.blockData = new Uint8Array(16 * 32);
        this.modeCount = 30;
        this.mode = 0;
        this.config = {
            das: 18,
            repeatSpeed: 3,
            gravidy: 2,
            ghost: true,
            lineClear: 30,
            are: 30,
            lineAre: 30,
            resetLimit: 15,
            lineWait: 10,
            lock: 20,
            invisibleCount: 0
        };
        let nextMino: INextMino | undefined;
        if (this.listener.getNextMino) {
            nextMino = this.listener.getNextMino();
        }
        if (!nextMino) {
            nextMino = new BoxNextMino();
        }
        this.nextMinoProc = nextMino;

        let mino: { [key: string]: Tetrimino } | undefined;
        if (this.listener.getTetrimino) {
            mino = this.listener.getTetrimino();
        }
        if (!mino) {
            mino = tetriminoData;
        }
        this.tetrimino = mino;
        let index = 0;
        for (let key in this.tetrimino) {
            index++;
            this.tetrimino[key] = Object.assign({}, this.tetrimino[key], {
                index: index
            });
        }
        this.makeNext();
    }

    private makeNext(): void {
        if (this.nextMino.length > 7) {
            return;
        }
        for (let i = 0; i < 7; i++) {
            this.nextMino.push(this.tetrimino[this.nextMinoProc.nextMino(this.minoCount++)]);
        }
    }

    private setCurMino(mino: Tetrimino): void {
        this.curMino = {
            dropCount: 0,
            mino: mino,
            resetCount: 0,
            rotate: 0,
            touchCount: 0,
            x: 3,
            y: 20,
            hold: false,
            block: [],
            lastGhost: undefined,
            lastPos: undefined
        };
        // ここでブロックの作成
        for (let ix = 0; ix < 4; ix++) {
            let flag = this.curMino.mino.pattern[ix];
            let blk: number[] = [];
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    if ((flag & 0x8000) !== 0) {
                        blk.push(x, -y);
                    }
                    flag <<= 1;
                }
            }
            this.curMino.block.push(blk);
        }
        // GameOver判定
        if (!this.canMove(0, 0, 0)) {
            console.log("Game Over");
            this.setInsertPlay(new TetrisGameOverPlay());
        }
    }

    public stepFrame(num: number = 1): void {
        this.button.stepFrame(num);
        for (let i = 0; i < num; i++) {
            // ブロックのアニメーション
            for (let y = 0; y < 20; y++) {
                let flag = this.blockData[(y << 4) | 15];
                if (flag > 0) {
                    let newFlag = 0;
                    for (let x = 0; x < 10; x++) {
                        let v = this.blockData[(y << 4) | x];
                        if ((v & 0x78) > 0 && (flag === 2 || (v & 0x78) !== 0x50)) {
                            this.blockData[(y << 4) | x] = Math.max(0, v - 8);
                            newFlag = flag;
                        }
                    }
                    // アニメーション終了
                    this.blockData[(y << 4) | 15] = newFlag;
                }
            }
            if (this.insertPlay) {
                if (!this.insertPlay.onInsertFrame(this)) {
                    this.insertPlay = undefined;
                }
                continue;
            }
            if (this.mode === 0) {
                if (this.modeCount > 0) {
                    this.modeCount--;
                    continue;
                }
                // 次のミノ
                this.setCurMino(this.nextMino.splice(0, 1)[0]);
                this.mode = 1;
                this.makeNext();
                const ret = this.listener.onNext(this.config);
                if (ret) {
                    this.config = ret;
                    this.button.setDas(this.config.das);
                    this.button.setRepeatSpeed(this.config.repeatSpeed);
                }
            }
            if (this.mode === 3) {
                // 消える待ち
                if (this.modeCount > 0) {
                    this.modeCount--;
                    continue;
                }
                this.mode = 4;
                this.modeCount = this.config.lineClear;
                this.listener.onAttach(this.curMino!.lastPos!, this.delLines);
            }
            if (this.mode === 4) {
                if (this.modeCount > 0) {
                    this.modeCount--;
                    continue;
                }
                // ブロックを落とす
                let dy = 1;
                for (let y = this.delLines[0]; y < 24; y++) {
                    if (dy < this.delLines.length && y + dy === this.delLines[dy]) {
                        dy++;
                        y--;
                        continue;
                    }
                    this.blockData.set(this.blockData.subarray((y + dy) << 4, (y + dy + 1) << 4), y << 4);
                }
                this.mode = 0;
                this.modeCount = this.config.lineAre;
                continue;
            }
            if (this.mode === 1 || this.mode === 2) {
                // 移動する
                if (!this.curMino.hold && this.button.isHold()) {
                    // ホールド
                    const before = this.getTetrimino(0)!;
                    if (!this.holdMino) {
                        if (this.listener.onMove) {
                            this.listener.onMove(before, { index: -1, pos: [] }, ButtonType.Hold);
                        }
                        this.holdMino = this.nextMino.splice(0, 1)[0];
                    } else if (this.listener.onMove) {
                        this.listener.onMove(before, this.getTetrimino(-1)!, ButtonType.Hold);
                    }
                    const bak = this.curMino.mino;
                    this.setCurMino(this.holdMino);
                    this.holdMino = bak;
                    this.curMino.hold = true;
                    this.listener.onHold();
                }
                let reset = false;
                // 回転
                const before = this.getTetrimino(0)!;
                let moveType = ButtonType.Drop;
                if (this.button.isRightTurn()) {
                    if (this.canMove(0, 0, 1)) {
                        this.curMino.rotate = (this.curMino.rotate + 1) & 3;
                        reset = true;
                    } else {
                        // SRS
                        const offset = this.curMino.mino.srs.right[this.curMino.rotate];
                        for (let ix = 0; ix < offset.length; ix += 2) {
                            let dx = offset[ix];
                            let dy = offset[ix + 1];
                            if (this.canMove(dx, dy, 1)) {
                                this.curMino.rotate = (this.curMino.rotate + 1) & 3;
                                this.curMino.x += dx;
                                this.curMino.y += dy;
                                reset = true;
                                break;
                            }
                        }
                    }
                    if (reset) {
                        moveType = ButtonType.RightTurn;
                    }
                } else if (this.button.isLeftTurn()) {
                    if (this.canMove(0, 0, 3)) {
                        this.curMino.rotate = (this.curMino.rotate + 3) & 3;
                        reset = true;
                    } else {
                        // SRS
                        const offset = this.curMino.mino.srs.left[this.curMino.rotate];
                        for (let ix = 0; ix < offset.length; ix += 2) {
                            let dx = offset[ix];
                            let dy = offset[ix + 1];
                            if (this.canMove(dx, dy, 3)) {
                                this.curMino.rotate = (this.curMino.rotate + 3) & 3;
                                this.curMino.x += dx;
                                this.curMino.y += dy;
                                reset = true;
                                break;
                            }
                        }
                    }
                    if (reset) {
                        moveType = ButtonType.LeftTurn;
                    }
                }
                // 左右移動
                if (this.button.isRight()) {
                    if (this.canMove(1, 0, 0)) {
                        this.curMino.x++;
                        reset = true;
                        moveType = ButtonType.Right;
                    }
                } else if (this.button.isLeft()) {
                    if (this.canMove(-1, 0, 0)) {
                        this.curMino.x--;
                        reset = true;
                        moveType = ButtonType.Left;
                    }
                }
                if (reset) {
                    this.curMino.lastGhost = undefined;
                    this.curMino.lastPos = undefined;
                }
                // ドロップ
                if (this.mode === 2) {
                    // 遊びの時間
                    if (this.canMove(0, -1, 0)) {
                        // 移動できるようになった
                        this.mode = 1;
                        if (this.curMino.resetCount < this.config.resetLimit) {
                            this.curMino.touchCount = 0;
                        }
                        this.curMino.dropCount = Math.max(GRAVIDY_SCALE - this.config.gravidy, 0);
                    } else {
                        if (reset && this.curMino.resetCount < this.config.resetLimit) {
                            this.curMino.resetCount++;
                            this.curMino.touchCount = 0;
                        }
                        if (!this.button.isSoftDrop() && this.curMino.touchCount < this.config.lock) {
                            this.curMino.touchCount++;
                            continue;
                        }
                        // 遊びが終わった
                        const mino = this.getTetrimino(0)!;
                        for (let ix = 0; ix < mino.pos.length; ix += 2) {
                            let x = mino.pos[ix];
                            let yix = mino.pos[ix + 1] << 4;
                            this.blockData[yix | x] = this.curMino.mino.index! | 0xf8;
                            // アニメーションマーク
                            this.blockData[yix | 15] = 1;
                            if (this.config.invisibleCount) {
                                // 消えるまでのカウントを設定する
                                this.blockData[yix | (10 + (x >> 1))] |= (this.config.invisibleCount << ((x & 1) * 4));
                            }
                        }
                        this.button.resetTouch();
                        if (this.checkDeleteLines()) {
                            // ラインが消えた
                            this.mode = 3;
                            this.modeCount = this.config.lineWait;
                        } else {
                            this.mode = 0;
                            this.modeCount = this.config.are;
                            this.listener.onAttach(this.curMino.lastPos!, []);
                        }
                        continue;
                    }
                }
                // 自由落下
                this.curMino.dropCount += this.config.gravidy;
                let bak = this.curMino.dropCount;
                if (this.button.isHardDrop()) {
                    this.curMino.dropCount += GRAVIDY_SCALE * 20;
                } else if (this.button.isSoftDrop()) {
                    this.curMino.dropCount = Math.max(this.curMino.dropCount, GRAVIDY_SCALE);
                }
                while (this.curMino.dropCount >= GRAVIDY_SCALE) {
                    if (this.canMove(0, -1, 0)) {
                        this.curMino.dropCount -= GRAVIDY_SCALE;
                        bak -= GRAVIDY_SCALE;
                        this.curMino.y--;
                        this.curMino.lastPos = undefined;
                        moveType = ButtonType.Drop;
                        reset = true;
                    } else {
                        // 地面にくっついた
                        this.curMino.dropCount = 0;
                        this.mode = 2;
                        //this.curMino.touchCount = 0;
                        break;
                    }
                }
                if (reset) {
                    // 移動した
                    if (this.listener.onMove) {
                        this.listener.onMove(before, this.getTetrimino(0)!, moveType);
                    }
                }
                if (bak < 0) {
                    // 操作で落下させた
                    this.listener.onDrop(Math.ceil(-bak / GRAVIDY_SCALE));
                }
            }
        }
    }

    private canMove(dx: number, dy: number, dix: number): boolean {
        let ix = (this.curMino.rotate + dix) & 3;
        for (let i = 0; i < 4; i++) {
            let x = this.curMino.block[ix][i * 2] + this.curMino.x + dx;
            let y = this.curMino.block[ix][i * 2 + 1] + this.curMino.y + dy;
            if (x < 0 || x >= 10 || y < 0) {
                return false;
            }
            if (this.blockData[(y << 4) | x] !== 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * 消えるラインがあるかをチェックする
     * @returns 
     */
    private checkDeleteLines(): boolean {
        this.delLines = [];
        for (let y = 0; y < 20; y++) {
            let count = 0;
            const yix = y << 4;
            for (let x = 0; x < 10; x++) {
                if (this.blockData[yix | x]) {
                    count++;
                    // invisibleのチェック
                    let cnt = (this.blockData[yix | (10 + (x >> 1))] >> ((x & 1) * 4)) & 15;
                    if (cnt > 0) {
                        cnt--;
                        const ix = yix | (10 + (x >> 1));
                        this.blockData[ix] = (this.blockData[ix] & (0xf0 >> ((x & 1) * 4))) | (cnt << ((x & 1) * 4));
                        if (cnt === 0) {
                            // 消え始める
                            this.blockData[yix | x] = (this.blockData[yix | x] & 0x87) | 0x38;
                            this.blockData[yix | 15] = 1;
                        }
                    }
                }
            }
            if (count === 10) {
                this.delLines.push(y);
                for (let x = 0; x < 10; x++) {
                    this.blockData[yix | x] = (this.blockData[(y << 4) | x] & 7) | 0x78;
                }
                this.blockData[yix | 15] = 2;
            }
        }
        return this.delLines.length > 0;
    }

    public getGhost(): number[] | null {
        if (this.mode !== 1 && this.mode !== 2) {
            return null;
        }
        if (!this.config.ghost) {
            return null;
        }
        if (this.curMino.lastGhost) {
            return this.curMino.lastGhost;
        }
        let dy = 0;
        while (this.canMove(0, dy - 1, 0)) {
            dy--;
        }
        let pos: number[] = [];
        const blk = this.curMino.block[this.curMino.rotate];
        for (let i = 0; i < 4; i++) {
            pos.push(this.curMino.x + blk[i * 2], this.curMino.y + dy + blk[i * 2 + 1]);
        }
        this.curMino.lastGhost = pos;
        return pos;
    }

    /**
     * テトリミノの座標を得る
     * @param num  -1:Hold, 0:Current, 1-:next
     * @returns 
     */
    public getTetrimino(num: number): {
        index: number;
        pos: number[]
    } | null {
        let mino: Tetrimino | undefined;
        if (num < 0) {
            // Hold
            mino = this.holdMino;
        } else if (num === 0) {
            // Current
            if (this.mode !== 1 && this.mode !== 2) {
                // 移動中ではない
                return null;
            }
            let pos: number[];
            if (this.curMino.lastPos) {
                pos = this.curMino.lastPos;
            } else {
                pos = [];
                const blk = this.curMino.block[this.curMino.rotate];
                for (let i = 0; i < 4; i++) {
                    pos.push(this.curMino.x + blk[i * 2], this.curMino.y + blk[i * 2 + 1]);
                }
                this.curMino.lastPos = pos;
            }
            return {
                index: this.curMino.mino.index!,
                pos: pos
            };
        } else {
            mino = this.nextMino[num - 1];
        }
        if (mino) {
            let pos: number[] = [];
            let flag = mino.pattern[0];
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    if ((flag & 0x8000) !== 0) {
                        pos.push(x, -y);
                    }
                    flag <<= 1;
                }
            }
            return {
                index: mino.index!,
                pos: pos
            };
        }
        return null;
    }

    public getBlock(): Uint8Array {
        return this.blockData;
    }

    public setInsertPlay(play: ITetrisInsertPaly): void {
        this.insertPlay = play;
    }
    public getInsertPlay(): ITetrisInsertPaly | undefined {
        return this.insertPlay;
    }
    public isGameOver(): boolean {
        return this.overFlag;
    }
    public setGameOver(): void {
        this.overFlag = true;
    }
}



/**
 * ゲームオーバー
 */
export class TetrisGameOverPlay implements ITetrisInsertPaly {
    private lineY = 0;
    private timeCount = 0;

    public constructor() {
        // 何もなし
    }

    onInsertFrame(playData: PlayData): boolean {
        if (this.timeCount > 0) {
            this.timeCount--;
            return true;
        }
        if (this.lineY < 20) {
            const data = playData.getBlock();
            for (let x = 0; x < 10; x++) {
                if (data[(this.lineY << 4) | x] & 0x80) {
                    // ブロックがあった
                    data[(this.lineY << 4) | x] = 0xc0;
                }
            }
            this.lineY++;
        } else {
            playData.setGameOver();
        }
        this.timeCount = 12;
        return true;
    }
}