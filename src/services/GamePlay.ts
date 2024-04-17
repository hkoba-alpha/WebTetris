import { BlockRender, DrawBlockData, getBlockRender } from "./BlockRender";
import { FontRender, getFontRender } from "./FontRender";
import { ButtonType, IPlay, StickData } from "./PlayData";
import { ButtonData, INextMino, ITetrisListener, PlayConfig, PlayData, TgmConfig, TgmPlayListener, minoColorPattern } from "./TetrisService";
import { TitlePlay } from "./TitlePlay";

const buttonTypeList = [
    ButtonType.Left,
    ButtonType.Right,
    ButtonType.HardDrop,
    ButtonType.Drop,
    ButtonType.LeftTurn,
    ButtonType.RightTurn,
    ButtonType.Hold,
];

const minoColorList = minoColorPattern[0];

export class GamePlay implements IPlay, ITetrisListener {
    private button: ButtonData;
    private fontRender: FontRender;
    private blockRender: BlockRender;
    private playData: PlayData;
    private tgmListener: TgmPlayListener;
    private buttonState: boolean[] = [];
    private lastWeight: {
        horizontal: number;
        vertical: number;
    } = {
            horizontal: 0,
            vertical: 0
        };
    private shadowList: {
        index: number,
        pos: number[],
        alpha: number;
    }[] = [];
    private breakList: {
        index: number;
        pos: number[];
        veloc: number[];
        accel: number[];
    }[] = [];
    private nextPos = 0;
    private startCount = 180;

    public constructor(gl: WebGL2RenderingContext, config: TgmConfig) {
        this.button = new ButtonData();
        this.fontRender = getFontRender(gl);
        this.blockRender = getBlockRender(gl);
        this.tgmListener = new TgmPlayListener(config);
        this.playData = new PlayData(this.button, this);
        this.blockRender.setWeight(0, 0);
    }
    onHold(): void {
        this.tgmListener.onHold();
    }
    onDrop(num: number): void {
        this.tgmListener.onDrop(num);
    }
    onAttach(pos: number[], delLines: number[]): void {
        if (delLines.length > 0) {
            const block = this.playData.getBlock();
            for (let i = 0; i < delLines.length; i++) {
                for (let x = 0; x < 10; x++) {
                    const index = block[delLines[i] * 16 + x] & 7;
                    this.breakList.push({
                        index: index,
                        pos: [x, 19 - delLines[i], 0, 0],
                        veloc: [(x - 4.5) / 20.0, -0.5 + (delLines.length - i) / 10.0, 0.05, 1],
                        accel: [0, 0.05, 0, 0]
                    });
                }
            }
        }
        this.tgmListener.onAttach(pos, delLines);
    }
    onNext(config: PlayConfig): PlayConfig {
        this.nextPos = 5;
        return this.tgmListener.onNext(config);
    }
    getNextMino(): INextMino {
        return this.tgmListener.getNextMino();
    }
    onMove(before: { index: number; pos: number[]; }, after: { index: number; pos: number[]; }, type: ButtonType): void {
        if (type === ButtonType.Hold) {
            let mx = before.pos[0];
            let my = before.pos[1];
            for (let i = 2; i < before.pos.length; i += 2) {
                if (before.pos[i] < mx) {
                    mx = before.pos[i];
                }
                if (before.pos[i + 1] > my) {
                    my = before.pos[i + 1];
                }
            }
            let newpos: number[] = [];
            for (let i = 0; i < before.pos.length; i += 2) {
                newpos.push(before.pos[i] - mx - 6, before.pos[i + 1] - my + 18);
            }
            this.addShadow(before.index, before.pos, newpos);
            if (after.index > 0) {
                let oldpos: number[] = [];
                newpos = [];
                for (let i = 0; i < after.pos.length; i += 2) {
                    oldpos.push(after.pos[i] - 5, after.pos[i + 1] + 18);
                    newpos.push(after.pos[i] + 3, after.pos[i + 1] + 18);
                }
                this.addShadow(after.index, oldpos, newpos);
            }
        } else if (type !== ButtonType.Left && type !== ButtonType.Right) {
            this.addShadow(before.index, before.pos, after.pos);
        }
    }
    private addShadow(index: number, before: number[], after: number[]): void {
        const sz = Math.max(Math.abs(before[0] - after[0]), Math.abs(before[1] - after[1]));
        for (let i = 0; i < sz; i += 5) {
            for (let j = 0; j < before.length; j += 2) {
                this.shadowList.push({
                    index: index,
                    pos: [before[j] + (after[j] - before[j]) * i / sz, before[j + 1] + (after[j + 1] - before[j + 1]) * i / sz, 0],
                    alpha: 1 - (sz - i - 1) * 0.02
                });
            }
        }
    }

    stepFrame(gl: WebGL2RenderingContext, stick: StickData): IPlay {
        // 影
        for (let i = 0; i < this.shadowList.length; i++) {
            this.shadowList[i].alpha -= 0.1;
            if (this.shadowList[i].alpha <= 0) {
                this.shadowList.splice(i, 1);
                i--;
            }
        }
        // 消えるブロック
        for (let i = 0; i < this.breakList.length; i++) {
            let dt = this.breakList[i];
            for (let j = 0; j < 4; j++) {
                dt.pos[j] += dt.veloc[j];
                dt.veloc[j] += dt.accel[j];
            }
            if (dt.pos[1] > 24) {
                this.breakList.splice(i, 1);
                i--;
            }
        }
        let btn = [
            stick.isLeft(),
            stick.isRight(),
            stick.isHardDrop(),
            stick.isDrop(),
            stick.isLeftTurn(),
            stick.isRightTurn(),
            stick.isHold()
        ];
        for (let i = 0; i < buttonTypeList.length; i++) {
            if (btn[i] !== this.buttonState[i]) {
                if (btn[i]) {
                    this.button.push(buttonTypeList[i]);
                } else {
                    this.button.release(buttonTypeList[i]);
                }
            }
        }
        this.buttonState = btn;
        if (this.startCount > 0) {
            this.startCount--;
        } else {
            this.playData.stepFrame(1);
        }
        let data: DrawBlockData = {
            block: [],
            shadow: [],
            next: []
        };
        for (let dt of this.breakList) {
            let col = minoColorList[dt.index];
            if (dt.pos[3] & 2) {
                col = [1, 1, 1];
            }
            data.block.push({
                pos: [dt.pos[0], dt.pos[1], dt.pos[2]],
                color: [col[0], col[1], col[2], 1]
            });
        }
        const current = this.playData.getTetrimino(0);
        if (current) {
            const col = minoColorList[current.index];
            for (let i = 0; i < current.pos.length; i += 2) {
                data.block.push({
                    pos: [current.pos[i], 19 - current.pos[i + 1], 0],
                    color: [col[0], col[1], col[2], 1]
                });
            }
            const ghost = this.playData.getGhost();
            if (ghost) {
                for (let i = 0; i < ghost.length; i += 2) {
                    data.block.push({
                        pos: [ghost[i], 19 - ghost[i + 1], 0],
                        color: [col[0], col[1], col[2], 0.4]
                    });
                }
            }
        }
        for (let dt of this.shadowList) {
            const col = minoColorList[dt.index];
            data.shadow.push({
                pos: [dt.pos[0], 19 - dt.pos[1], 0],
                color: [col[0], col[1], col[2], dt.alpha]
            });
        }
        const hold = this.playData.getTetrimino(-1);
        if (hold) {
            const col = minoColorList[hold.index];
            for (let i = 0; i < hold.pos.length; i += 2) {
                data.next.push({
                    pos: [hold.pos[i] - 6, 2 - hold.pos[i + 1], 0],
                    color: [col[0], col[1], col[2], 1]
                });
            }
        }
        if (this.nextPos > 0) {
            this.nextPos -= 0.25;
            if (this.nextPos < 0) {
                this.nextPos = 0;
            }
        }
        let dx = 3 + this.nextPos;
        let dy = -2.5;
        for (let i = 1; i < 6; i++) {
            let next = this.playData.getTetrimino(i);
            if (!next) {
                break;
            }
            const col = minoColorList[next.index];
            // いったん保留
            if (i === 1000 && !current) {
                // nextを描画
                for (let i = 0; i < next.pos.length; i += 2) {
                    data.block.push({
                        pos: [next.pos[i] + dx, dy - next.pos[i + 1] - 1.5, 0],
                        color: [col[0], col[1], col[2], 1]
                    });
                }
            } else {
                for (let i = 0; i < next.pos.length; i += 2) {
                    data.next.push({
                        pos: [next.pos[i] + dx, dy - next.pos[i + 1], 0],
                        color: [col[0], col[1], col[2], 1]
                    });
                }
            }
            dx += 5;
            if (dx > 13) {
                dy += (dx - 13) * 3 / 5;
                dx = 13;
            }
        }

        const block = this.playData.getBlock();
        let topHeight = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let weight = 0;
        for (let y = 19; y >= 0; y--) {
            for (let x = 0; x < 10; x++) {
                let blk = block[y * 16 + x];
                /*
                 * 0:ブロックなし
                 * baaa aZZZ
                 * b: ブロックあり
                 * aaaa: 透明度、10=そのまま、10未満=半透明、11以上=光る
                 */
                if (blk & 128) {
                    weight += (x - 4.5);
                    if (y > topHeight[x]) {
                        topHeight[x] = y;
                    }
                    // ブロックあり
                    const aaa = (blk & 0x78) >> 3;
                    let alpha = 1;
                    let col = minoColorList[blk & 7];
                    if (aaa < 10) {
                        alpha = aaa / 10.0;
                    } else if (aaa > 10) {
                        col = [aaa * 0.05 + 0.4, aaa * 0.05 + 0.4, aaa * 0.05 + 0.4];
                    }
                    data.block.push({
                        pos: [x, 19 - y, 0],
                        color: [col[0], col[1], col[2], alpha]
                    });
                }
            }
        }
        let ver = 20;
        for (let top of topHeight) {
            if (top < ver) {
                ver = top;
            }
        }
        if (this.lastWeight.horizontal !== weight || this.lastWeight.vertical !== ver) {
            if (this.lastWeight.horizontal < weight) {
                this.lastWeight.horizontal += 1;
                if (this.lastWeight.horizontal > weight) {
                    this.lastWeight.horizontal = weight;
                }
            } else if (this.lastWeight.horizontal > weight) {
                this.lastWeight.horizontal -= 1;
                if (this.lastWeight.horizontal < weight) {
                    this.lastWeight.horizontal = weight;
                }
            }
            if (this.lastWeight.vertical < ver) {
                this.lastWeight.vertical += 0.05;
                if (this.lastWeight.vertical > ver) {
                    this.lastWeight.vertical = ver;
                }
            } else if (this.lastWeight.vertical > ver) {
                this.lastWeight.vertical -= 0.05;
                if (this.lastWeight.vertical < ver) {
                    this.lastWeight.vertical = ver;
                }
            }
            this.blockRender.setWeight(this.lastWeight.horizontal, this.lastWeight.vertical);
        }
        this.blockRender.draw(gl, data);

        this.fontRender.draw(gl, "SCORE", [-0.9, -0.3, 0.25, 0.05], [1, 1, 1]);
        let sc = String(this.tgmListener.level).padStart(4, ' ');
        let nxsc = String(this.tgmListener.nextLevel).padStart(4, ' ');

        this.fontRender.draw(gl, sc, [-0.9, -0.2, 0.2, 0.05], [1, 1, 1]);
        this.fontRender.draw(gl, nxsc, [-0.9, -0.12, 0.2, 0.05], [1, 1, 1]);

        if (this.playData.isGameOver()) {
            this.fontRender.draw(gl, "GAME OVER", [-0.5, -0.1, 1, 0.2], [1, 0.4, 0.3, 1]);
            this.fontRender.draw(gl, "PRESS " + stick.getButtonName(ButtonType.Start), [-0.3, 0.3, 0.6, 0.1], [1, 1, 1]);
            if (stick.isStart(true)) {
                return new TitlePlay(gl);
            }
        } else if (this.startCount > 0) {
            if (this.startCount > 60) {
                const cl = Math.cos(this.startCount * Math.PI / 20) * 0.3;
                this.fontRender.draw(gl, "READY", [-0.3, -0.05, 0.6, 0.1], [cl + 0.7, cl + 0.7, 1]);
            } else {
                this.fontRender.draw(gl, "GO", [-0.1, -0.05, 0.2, 0.1], [1, 1, 1]);
            }
        }

        return this;
    }

}