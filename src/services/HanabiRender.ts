const v_shader = `
uniform vec2 u_size;
// xy: ピクセル座標 z: 距離
uniform vec3 u_pos;
// 方向
attribute vec3 a_vec;
uniform vec4 u_color;

varying vec4 v_color;
varying vec2 v_pos;

void main() {
    vec2 xy = vec2(u_pos.x + a_vec.x * u_pos.z, u_size.y - (u_pos.y + a_vec.y * u_pos.z));
    vec2 xy2 = vec2(xy.x / u_size.x * 2.0 - 1.0, xy.y / u_size.y * 2.0 - 1.0);
    gl_Position = vec4(xy2, 0.0, 1.0);
    float light = 1.1 + cos(u_pos.z) * 0.2;
    v_color = vec4(u_color.rgb * light, u_color.a);
    v_pos = xy;
    gl_PointSize = 5.0;
}
`;

const f_shader = `
precision mediump float;

varying vec4 v_color;
varying vec2 v_pos;

void main() {
    float distance = length(v_pos - gl_FragCoord.xy);
    gl_FragColor = vec4(v_color.rgb, v_color.a / (1.0 + distance));
}
`;

const HANABI_TIME = 60;

const colorList = [
    [1, 0.7, 0],
    [0.7, 0, 0.7],
    [0, 0.7, 0],
    [0.4, 0.4, 1],
    [1, 0.6, 0.8]
];

export class HanabiData {
    private count: number;
    private vy: number;
    private color: number[];

    public constructor(private cx: number, private cy: number, private size: number) {
        this.count = 0;
        this.vy = Math.random() * 4 - this.cy / 100 - 2;
        this.color = colorList[Math.floor(Math.random() * colorList.length)];
    }

    public stepFrame(): boolean {
        this.count++;
        if (this.count > HANABI_TIME) {
            return false;
        }
        return true;
    }

    public getPos(): number[] {
        this.cy += this.vy;
        this.vy += 0.1;
        const len = Math.sin(this.count * Math.PI / HANABI_TIME / 2) * this.size;
        return [this.cx, this.cy, len];
    }
    public getColor(): number[] {
        let alpha = 1;
        if (this.count > HANABI_TIME - 20) {
            alpha = (HANABI_TIME - this.count) / 20.0;
        }
        return [this.color[0], this.color[1], this.color[2], alpha];
    }
}

export class HanabiRender {
    private program: WebGLProgram;
    private aVec: number;
    private uColor: WebGLUniformLocation;
    private uPos: WebGLUniformLocation;
    private uSize: WebGLUniformLocation;
    private posVbo: WebGLBuffer;

    public constructor(gl: WebGL2RenderingContext) {
        let vs = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vs, v_shader);
        gl.compileShader(vs);
        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(vs));
        }
        let fs = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fs, f_shader);
        gl.compileShader(fs);
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(fs));
        }
        this.program = gl.createProgram()!;
        gl.attachShader(this.program, vs);
        gl.attachShader(this.program, fs);
        gl.linkProgram(this.program);
        //
        gl.useProgram(this.program);
        this.aVec = gl.getAttribLocation(this.program, "a_vec");
        this.uColor = gl.getUniformLocation(this.program, "u_color")!;
        this.uPos = gl.getUniformLocation(this.program, "u_pos")!;
        this.uSize = gl.getUniformLocation(this.program, "u_size")!;
        // buffer
        this.posVbo = gl.createBuffer()!;
        let vec: number[] = [];
        for (let z = 0; z < 8; z++) {
            for (let i = 0; i < 16; i++) {
                let rad = (i * 2 + Math.random()) * Math.PI / 16;
                let radz = (z * 2 + Math.random()) * Math.PI / 35;
                let xylen = Math.cos(radz);
                vec.push(xylen * Math.cos(rad), xylen * Math.sin(rad), Math.sin(radz));
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posVbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vec), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    public draw(gl: WebGL2RenderingContext, data: HanabiData[]): void {
        gl.useProgram(this.program);
        gl.enable(gl.CULL_FACE);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.posVbo);
        gl.enableVertexAttribArray(this.aVec);
        gl.vertexAttribPointer(this.aVec, 3, gl.FLOAT, false, 0, 0);

        gl.uniform2f(this.uSize, 512, 512);
        for (let dt of data) {
            gl.uniform3fv(this.uPos, dt.getPos());
            gl.uniform4fv(this.uColor, dt.getColor());
            gl.drawArrays(gl.POINTS, 0, 128);
        }
    }
}


let render: HanabiRender;

export function getHanabiRender(gl: WebGL2RenderingContext): HanabiRender {
    if (!render) {
        render = new HanabiRender(gl);
    }
    return render;
}