import { BlockRender, getBlockRender } from "./BlockRender";
import { FontRender, getFontRender } from "./FontRender";
import { GamePlay } from "./GamePlay";
import { IPlay, StickData } from "./PlayData";

export class TitlePlay implements IPlay {
    private fontRender: FontRender;

    public constructor(gl: WebGL2RenderingContext) {
        this.fontRender = getFontRender(gl);
    }

    stepFrame(gl: WebGL2RenderingContext, stick: StickData): IPlay {
        if (stick.isStart(true)) {
            return new GamePlay(gl);
        }
        gl.clearColor(0, 0, 0, 1);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.fontRender.drawFrame(gl, [-0.7, -0.8, 1.4, 0.8], [0.2, 0.4, 0.2], [0.9, 0.9, 0.4]);
        this.fontRender.draw(gl, "TETRIS", [-0.6, -0.7, 1.2, 0.6], [0.7, 0.7, 0.7]);
        gl.flush();
        return this;
    }

}