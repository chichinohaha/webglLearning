import { glMatrix, mat4, vec3 } from "gl-matrix";

export default class Camera {
	position: vec3
	yaw: number
	pitch: number
	roll: number
	worldup: vec3
	front!: vec3;
	right!: vec3;
	up!: vec3;
	constructor(gl: WebGLRenderingContext, pos: vec3, yaw: number = -90, pitch: number = 0, roll: number = 0, worldup: vec3 = [0, 1, 0]) {
		this.position = pos
		this.yaw = yaw
		this.pitch = pitch
		this.roll = roll
		this.worldup = worldup
		this.updateCameraVectors()
	}
	public getViewMatrix() {
		this.updateCameraVectors();
		const outMat4: mat4 = mat4.create();
		const center = vec3.create();
		vec3.add(center, this.position, this.front)
		return mat4.lookAt(outMat4, this.position, center, this.up)
	}
	private updateCameraVectors() {
		const x = Math.cos(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))
		const y = Math.sin(glMatrix.toRadian(this.pitch))
		const z = Math.sin(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))
		const _front = vec3.create()
		_front[0] = x
		_front[1] = y
		_front[2] = z
		this.front = vec3.normalize([0, 0, 0], _front)
		this.right = vec3.normalize([0, 0, 0], vec3.cross([0, 0, 0], _front, this.worldup))
		this.up = vec3.normalize([0, 0, 0], vec3.cross([0, 0, 0], this.right, _front))
	}

}