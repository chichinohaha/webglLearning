import { mat2, mat3, mat4, vec2, vec3, vec4 } from "gl-matrix"

export default class Shader {
	constructor(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
		this.vertexSource = vertexSource
		this.fragmentSource = fragmentSource
		this.program = this.initShaderProgram(gl, vertexSource, fragmentSource)
		this.gl = gl
	}
	//
	// 创建指定类型的着色器，上传source源码并编译
	//
	private loadShader(gl: WebGLRenderingContext, type: number, source: string) {
		const shader = gl.createShader(type) as WebGLShader

		// Send the source to the shader object

		gl.shaderSource(shader, source)

		// Compile the shader program

		gl.compileShader(shader)

		// See if it compiled successfully

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert(
				'An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader)
			)
			gl.deleteShader(shader)
			return null
		}
		return shader
	}
	private initShaderProgram(
		gl: WebGLRenderingContext,
		vsSource: string,
		fsSource: string
	) {
		const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource) as WebGLShader
		const fragmentShader = this.loadShader(
			gl,
			gl.FRAGMENT_SHADER,
			fsSource
		) as WebGLShader

		// 创建着色器程序

		const shaderProgram = gl.createProgram() as WebGLProgram
		gl.attachShader(shaderProgram, vertexShader)
		gl.attachShader(shaderProgram, fragmentShader)
		gl.linkProgram(shaderProgram)

		// 创建失败， alert
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			alert(
				'Unable to initialize the shader program: ' +
				gl.getProgramInfoLog(shaderProgram)
			)
			return null
		}

		return shaderProgram
	}
	vertexSource: string
	fragmentSource: string
	program: WebGLProgram | null
	gl: WebGLRenderingContext
	public setUniform(name: string, value: boolean | number) {
		if (this.program) {
			this.gl.uniform1i(this.gl.getUniformLocation(this.program, name) as WebGLUniformLocation, value as unknown as number)
		}
	}
	public setVec2(name: string, x: number, y: number): void
	public setVec2(name: string, value: vec2): void
	public setVec2(name: string, value: vec2 | number, y?: number): void {
		if (this.program) {
			if (typeof y === 'number' && typeof value === 'number') {
				this.gl.uniform2f(this.gl.getUniformLocation(this.program, name) as WebGLUniformLocation, value, y)
			} else if (typeof value !== 'number') {
				this.gl.uniform2fv(this.gl.getUniformLocation(this.program, name) as WebGLUniformLocation, value)
			}
		}
	}

	public setVec3(name: string, x: number, y: number, z: number): void
	public setVec3(name: string, value: vec3): void
	public setVec3(name: string, value: vec3 | number, y?: number, z?: number): void {
		if (this.program) {
			if (typeof y === 'number' && typeof value === 'number' && typeof z === 'number') {
				this.gl.uniform3f(this.gl.getUniformLocation(this.program, name) as WebGLUniformLocation, value, y, z)
			} else if (typeof value !== 'number') {
				this.gl.uniform3fv(this.gl.getUniformLocation(this.program, name) as WebGLUniformLocation, value)
			}
		}
	}

	public setVec4(name: string, x: number, y: number, z: number, w: number): void
	public setVec4(name: string, value: vec4): void
	public setVec4(name: string, value: vec4 | number, y?: number, z?: number, w?: number): void {
		if (this.program) {
			if (typeof y === 'number' && typeof value === 'number' && typeof z === 'number' && typeof w === 'number') {
				this.gl.uniform4f(this.gl.getUniformLocation(this.program, name) as WebGLUniformLocation, value, y, z, w)
			} else if (typeof value !== 'number') {
				this.gl.uniform4fv(this.gl.getUniformLocation(this.program, name) as WebGLUniformLocation, value)
			}
		}
	}
	public setMat2(name: string, mat: mat2) {
		if (this.program) {
			this.gl.uniformMatrix2fv(this.gl.getUniformLocation(this.program, name), false, mat)
		}
	}
	public setMat3(name: string, mat: mat3) {
		if (this.program) {
			this.gl.uniformMatrix3fv(this.gl.getUniformLocation(this.program, name), false, mat)
		}
	}
	public setMat4(name: string, mat: mat4) {
		if (this.program) {
			this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, name), false, mat)
		}
	}
	public use() {
		this.gl.useProgram(this.program)
	}
}