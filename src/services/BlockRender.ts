const v_shader = `
// xyz, a=色の明るさ
attribute vec4 a_pos;
attribute vec3 a_normal;

uniform vec3 u_blkpos;
uniform vec4 u_color;

uniform mat4 u_trans;
uniform mat4 u_proj;
uniform vec3 u_light;
varying vec4 v_color;

void main() {
    mat4 mvp = u_proj * u_trans;
    gl_Position = mvp * vec4(a_pos.xyz + u_blkpos, 1.0);
    float diffuse = dot((u_proj * vec4(a_normal, 1.0)).xyz, u_light) * 0.3 + 0.8;
    v_color = vec4(u_color.rgb * a_pos.a * diffuse, u_color.a);
}
`;

const f_shader = `
precision mediump float;

varying vec4 v_color;

void main() {
    gl_FragColor = v_color;
}
`;

export interface MinoBlock {
    pos: number[];
    color: number[];
}
export interface DrawBlockData {
    block: MinoBlock[];
    shadow: MinoBlock[];
    next: MinoBlock[];
}

export function getProjection(fieldOfViewInRadians: number, aspectRatio: number, near: number, far: number): number[] {
    let f = 1.0 / Math.tan(fieldOfViewInRadians / 2);
    let rangeInv = 1 / (near - far);

    return [
        f / aspectRatio, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
    ];
}
export function getTranslation(pos: number[], target: number[], up: number[]): number[] {
    function norm(vec: number[]): number[] {
        let len2 = 0;
        for (let v of vec) {
            len2 += v * v;
        }
        len2 = Math.sqrt(len2);
        let ret: number[] = [];
        for (let v of vec) {
            ret.push(v / len2);
        }
        return ret;
    }
    function cross(left: number[], right: number[]): number[] {
        return [
            left[1] * right[2] - left[2] * right[1],
            left[2] * right[0] - left[0] * right[2],
            left[0] * right[1] - left[1] * right[0]
        ];
    }
    function dot(left: number[], right: number[]): number {
        return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
    }
    let forward = norm([target[0] - pos[0], target[1] - pos[1], target[2] - pos[2]]);
    let right = norm(cross(up, forward));
    let up2 = cross(forward, right);
    return [
        right[0], up2[0], -forward[0], 0,
        right[1], up2[1], -forward[1], 0,
        right[2], up2[2], -forward[2], 0,
        -dot(right, pos), -dot(up2, pos), dot(forward, pos), 1
    ];
}

export class BlockRender {
    private program: WebGLProgram;
    private projection: number[];
    private translation: number[];
    private flatMvp: {
        projection: number[];
        translation: number[];
    };
    private uProj: WebGLUniformLocation;
    private uTrans: WebGLUniformLocation;
    private uLight: WebGLUniformLocation;
    private aPos: number;
    private aNormal: number;
    private uBlkpos: WebGLUniformLocation;
    private uColor: WebGLUniformLocation;
    private posVbo: WebGLBuffer;
    private normalVbo: WebGLBuffer;

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

        this.projection = getProjection(0.7, 1, 1, -1);
        let dy = 0;
        this.translation = getTranslation([5, 28 - dy, 25 - dy / 2], [5, 10 - dy / 2, 0], [0, -1, 0]);

        this.flatMvp = {
            projection: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            translation: [1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, -5, 10, -0.2, 13]
        }

        this.uProj = gl.getUniformLocation(this.program, "u_proj")!;
        this.uTrans = gl.getUniformLocation(this.program, "u_trans")!;
        this.uLight = gl.getUniformLocation(this.program, "u_light")!;
        this.aPos = gl.getAttribLocation(this.program, "a_pos");
        this.aNormal = gl.getAttribLocation(this.program, "a_normal");
        this.uBlkpos = gl.getUniformLocation(this.program, "u_blkpos")!;
        this.uColor = gl.getUniformLocation(this.program, "u_color")!;

        this.posVbo = gl.createBuffer()!;
        this.normalVbo = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posVbo);
        const st = 0.05;
        const ed = 1 - st;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            st, st, ed, 1,
            st, ed, ed, 0.9,
            ed, st, ed, 0.8,
            ed, ed, ed, 0.6,
            ed, st, ed, 0.9,
            ed, ed, ed, 0.8,
            ed, st, st, 0.8,
            ed, ed, st, 0.7,
            ed, ed, st, 1,
            ed, ed, ed, 0.9,
            st, ed, st, 0.8,
            st, ed, ed, 0.9,
            st, ed, st, 0.9,
            st, ed, ed, 0.8,
            st, st, st, 1.0,
            st, st, ed, 0.9,
            // ix=16, 外枠
            -0.5, 20.5, 1, 1.0,
            -0.5, 20.5, 0, 0.9,
            10.5, 20.5, 1, 0.9,
            10.5, 20.5, 0, 0.7,
            //
            0, 20, 1, 0.9,
            0, 20, 0, 0.7,
            0, 0, 1, 1.0,
            0, 0, 0, 0.8,
            //
            0, 0, 1, 1.0,
            0, 0, 0, 0.8,
            10, 0, 1, 0.9,
            10, 0, 0, 0.7,
            //
            10, 0, 1, 1.0,
            10, 0, 0, 0.9,
            10, 20, 1, 0.8,
            10, 20, 0, 0.7,
            // 表面
            10, 20, 1, 0.8,
            10.5, 20.5, 1, 1.0,
            10, 0, 1, 0.8,
            10.5, -0.5, 1, 1.0,
            0, 0, 1, 0.8,
            -0.5, -0.5, 1, 1.0,
            0, 20, 1, 0.8,
            -0.5, 20.5, 1, 1.0,
            10, 20, 1, 0.8,
            10.5, 20.5, 1, 1.0,
            // 残像 ix=42
            // 下面
            st, ed, ed, 1,
            ed, ed, ed, 1,
            st, ed, ed, 1,
            st, ed, st, 1,
            ed, ed, ed, 1,
            ed, ed, st, 1,
            st, ed, st, 1,
            ed, ed, st, 1,
            // 上縦
            st, st, ed, 1,
            st, ed, ed, 1,
            ed, st, ed, 1,
            ed, ed, ed, 1,
            // 下縦
            st, st, st, 1,
            st, ed, st, 1,
            ed, st, st, 1,
            ed, ed, st, 1,
            // 上面
            st, st, ed, 1,
            ed, st, ed, 1,
            st, st, st, 1,
            st, st, ed, 1,
            ed, st, st, 1,
            ed, st, ed, 1,
            st, st, st, 1,
            ed, st, st, 1,
            // 縦線 ix=66
            // 背景色
            0, 0, 0, 0.8,
            0, 20, 0, 1,
            10, 0, 0, 0.7,
            10, 20, 0, 0.9,
            // 縦線
            1, 0, 0, 1,
            1, 20, 0, 1,
            2, 0, 0, 1,
            2, 20, 0, 1,
            3, 0, 0, 1,
            3, 20, 0, 1,
            4, 0, 0, 1,
            4, 20, 0, 1,
            5, 0, 0, 1,
            5, 20, 0, 1,
            6, 0, 0, 1,
            6, 20, 0, 1,
            7, 0, 0, 1,
            7, 20, 0, 1,
            8, 0, 0, 1,
            8, 20, 0, 1,
            9, 0, 0, 1,
            9, 20, 0, 1,
        ]), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalVbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
            // 外枠
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
            // 表面
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, 1, 0, 0, 1,
            // 残像
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            // 背景
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            // 線
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, 1, 0, 0, 1,
        ]), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
    public setWeight(hor: number, ver: number): void {
        let dy = ver / 5;
        let dx = 5 - hor / 50;
        if (dx < 1) {
            dx = 1;
        } else if (dx > 9) {
            dx = 9;
        }
        this.translation = getTranslation([dx, 28 - dy, 25 - dy / 2], [5, 10 - dy / 2, 0], [0, -1, 0]);
    }

    public draw(gl: WebGL2RenderingContext, data: DrawBlockData): void {
        gl.useProgram(this.program);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.posVbo);
        gl.enableVertexAttribArray(this.aPos);
        gl.vertexAttribPointer(this.aPos, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalVbo);
        gl.enableVertexAttribArray(this.aNormal);
        gl.vertexAttribPointer(this.aNormal, 3, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(this.uProj, false, this.projection);
        gl.uniformMatrix4fv(this.uTrans, false, this.translation);
        gl.uniform3f(this.uLight, 0, -0.8, -0.6);

        // 外枠
        gl.uniform3f(this.uBlkpos, 0, 0, 0);
        //gl.uniform3f(this.uBlkpos, 0, 0, 0);
        gl.uniform4f(this.uColor, 1, 1, 1.0, 1.0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 16, 26);
        gl.uniform4f(this.uColor, 0, 0, 0.4, 1.0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 66, 4);
        //gl.drawArrays(gl.LINES, 66, 18);

        for (let dt of data.block) {
            gl.uniform3fv(this.uBlkpos, dt.pos);
            gl.uniform4fv(this.uColor, dt.color);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 16);
        }
        for (let dt of data.shadow) {
            gl.uniform3fv(this.uBlkpos, dt.pos);
            gl.uniform4fv(this.uColor, dt.color);
            gl.drawArrays(gl.LINES, 42, 24);
        }

        // その他
        gl.uniform3f(this.uLight, 0.4, 0.4, 0.8);
        gl.uniformMatrix4fv(this.uProj, false, this.flatMvp.projection);
        gl.uniformMatrix4fv(this.uTrans, false, this.flatMvp.translation);

        for (let dt of data.next) {
            gl.uniform3fv(this.uBlkpos, dt.pos);
            gl.uniform4fv(this.uColor, dt.color);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 16);
        }
    }
}

let render: BlockRender;

export function getBlockRender(gl: WebGL2RenderingContext): BlockRender {
    if (!render) {
        render = new BlockRender(gl);
    }
    return render;
}