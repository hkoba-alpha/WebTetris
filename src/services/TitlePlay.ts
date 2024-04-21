import { FontRender, getFontRender } from "./FontRender";
import { GamePlay } from "./GamePlay";
import { ButtonType, IPlay, StickData } from "./PlayData";
import { hardTgmConfig, normalTgmConfig, specialTgmConfig } from "./TetrisService";

const levelConfig = [
    normalTgmConfig,
    specialTgmConfig,
    hardTgmConfig,
];

export class TitlePlay implements IPlay {
    private fontRender: FontRender;
    private level: number;

    public constructor(gl: WebGL2RenderingContext) {
        this.fontRender = getFontRender(gl);
        this.level = 0;
    }

    stepFrame(gl: WebGL2RenderingContext, stick: StickData): IPlay {
        if (stick.isStart(true)) {
            return new GamePlay(gl, levelConfig[this.level]);
        }
        gl.clearColor(0, 0, 0, 1);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.fontRender.drawFrame(gl, [-0.8, -0.8, 1.6, 0.7], [0.2, 0.4, 0.2], [0.9, 0.9, 0.4]);
        this.fontRender.draw(gl, "TETRIS", [-0.7, -0.7, 1.4, 0.5], [0.7, 0.7, 0.7]);

        this.fontRender.drawFrame(gl, [-0.55 + this.level * 0.3, 0.15 + (this.level & 1) * 0.2, 0.5, 0.2], [0, 0, 0, 0], [1, 1, 0.5]);

        if (stick.isLeft(true)) {
            this.level = 0;
        } else if (stick.isRight(true)) {
            this.level = 2;
        } else if (stick.isDrop(true)) {
            this.level = 1;
        }

        this.fontRender.draw(gl, "SELECT LEVEL", [-0.3, 0, 0.6, 0.05], [0.7, 0.7, 1]);
        this.fontRender.draw(gl, "NORMAL", [-0.5, 0.2, 0.4, 0.1], [1, 1, 0.7]);
        this.fontRender.draw(gl, "HARD", [0.1, 0.2, 0.4, 0.1], [1, 1, 0.7]);
        this.fontRender.draw(gl, "SPECIAL", [-0.2, 0.4, 0.4, 0.1], [1, 1, 0.7]);

        this.fontRender.draw(gl, "PRESS " + stick.getButtonName(ButtonType.Start), [-0.4, 0.6, 0.8, 0.1], [1, 1, 1]);

        gl.flush();
        return this;
    }

}