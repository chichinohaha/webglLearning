<template>
  <div>
    <canvas id="canvas" width="800" height="600"></canvas>
  </div>
</template>

<script lang="ts">

import { Options, Vue } from 'vue-class-component'
const sizeOfFloat = 4
import fs from 'raw-loader!../public/fragment.fs'
import vs from 'raw-loader!../public/vertex.vs'
import { glMatrix, mat4, vec3 } from 'gl-matrix'
import Shader from './shader'
import Camera from './camera'
const vertices = [
  -0.5, -0.5, -0.5, 0.0, 0.0, -1.0,
  0.5, -0.5, -0.5, 0.0, 0.0, -1.0,
  0.5, 0.5, -0.5, 0.0, 0.0, -1.0,
  0.5, 0.5, -0.5, 0.0, 0.0, -1.0,
  -0.5, 0.5, -0.5, 0.0, 0.0, -1.0,
  -0.5, -0.5, -0.5, 0.0, 0.0, -1.0,

  -0.5, -0.5, 0.5, 0.0, 0.0, 1.0,
  0.5, -0.5, 0.5, 0.0, 0.0, 1.0,
  0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
  0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
  -0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
  -0.5, -0.5, 0.5, 0.0, 0.0, 1.0,

  -0.5, 0.5, 0.5, -1.0, 0.0, 0.0,
  -0.5, 0.5, -0.5, -1.0, 0.0, 0.0,
  -0.5, -0.5, -0.5, -1.0, 0.0, 0.0,
  -0.5, -0.5, -0.5, -1.0, 0.0, 0.0,
  -0.5, -0.5, 0.5, -1.0, 0.0, 0.0,
  -0.5, 0.5, 0.5, -1.0, 0.0, 0.0,

  0.5, 0.5, 0.5, 1.0, 0.0, 0.0,
  0.5, 0.5, -0.5, 1.0, 0.0, 0.0,
  0.5, -0.5, -0.5, 1.0, 0.0, 0.0,
  0.5, -0.5, -0.5, 1.0, 0.0, 0.0,
  0.5, -0.5, 0.5, 1.0, 0.0, 0.0,
  0.5, 0.5, 0.5, 1.0, 0.0, 0.0,

  -0.5, -0.5, -0.5, 0.0, -1.0, 0.0,
  0.5, -0.5, -0.5, 0.0, -1.0, 0.0,
  0.5, -0.5, 0.5, 0.0, -1.0, 0.0,
  0.5, -0.5, 0.5, 0.0, -1.0, 0.0,
  -0.5, -0.5, 0.5, 0.0, -1.0, 0.0,
  -0.5, -0.5, -0.5, 0.0, -1.0, 0.0,

  -0.5, 0.5, -0.5, 0.0, 1.0, 0.0,
  0.5, 0.5, -0.5, 0.0, 1.0, 0.0,
  0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
  0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
  -0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
  -0.5, 0.5, -0.5, 0.0, 1.0, 0.0
];

/**
 * Init and load Model to VAO VBO
 */
function initBuffers(gl: WebGLRenderingContext) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, sizeOfFloat * 6, 0)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, sizeOfFloat * 6, sizeOfFloat * 3)
  gl.enableVertexAttribArray(1)
  return positionBuffer
}

export default class App extends Vue {
  canvas: HTMLCanvasElement | null = null
  camera!: Camera
  keyboardMap: any = {}
  gl: WebGLRenderingContext | null = null
  shader!: Shader
  buffers!: WebGLBuffer
  isControlling = false
  handleKeyboardEvent(event: KeyboardEvent) {
    this.keyboardMap[event.key] = event.type === 'keydown';
  }
  processInput() {
    if (this.isControlling) {
      const cameraSpeed = 0.005
      if (this.keyboardMap['w']) {
        vec3.add(this.camera.position, this.camera.position, vec3.scale(vec3.create(), this.camera.front, cameraSpeed))
      }
      if (this.keyboardMap['s']) {
        vec3.add(this.camera.position, this.camera.position, vec3.scale(vec3.create(), this.camera.front, -cameraSpeed))
      }
      if (this.keyboardMap['a']) {
        vec3.add(this.camera.position, this.camera.position, vec3.scale(vec3.create(), this.camera.right, -cameraSpeed))
      }
      if (this.keyboardMap['d']) {
        vec3.add(this.camera.position, this.camera.position, vec3.scale(vec3.create(), this.camera.right, cameraSpeed))
      }
      if (this.keyboardMap['q']) {
        vec3.add(this.camera.position, this.camera.position, vec3.scale(vec3.create(), this.camera.up, -cameraSpeed))
      }
      if (this.keyboardMap['e']) {
        vec3.add(this.camera.position, this.camera.position, vec3.scale(vec3.create(), this.camera.up, cameraSpeed))
      }

    }
  }
  handleMouseEvent(event: MouseEvent) {
    if (this.isControlling) {
      const sensitivity = 0.05
      this.camera.yaw += event.movementX * sensitivity
      this.camera.pitch -= event.movementY * sensitivity
      if (this.camera.pitch > 89) {
        this.camera.pitch = 89
      } else if (this.camera.pitch < -89) {
        this.camera.pitch = -89
      }
      this.camera.updateCameraVectors()
    }
  }
  tick() {

    const gl = this.gl
    const camera = this.camera
    const canvas = this.canvas as HTMLCanvasElement
    const shader = this.shader
    gl!.clearColor(0.18, 0.04, 0.14, 1)
    gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT)
    gl!.enable(gl!.DEPTH_TEST);           // Enable depth testing
    gl!.depthFunc(gl!.LEQUAL);            // Near things obscure far things
    const projection = mat4.perspective(mat4.create(), glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 100)
    const lightPos: vec3 = [1.2, 1, 2]
    const view = camera.getViewMatrix()
    let model = mat4.create()
    gl!.bindBuffer(gl!.ARRAY_BUFFER, this.buffers)
    shader.use()
    shader.setMat4('view', view)
    shader.setMat4("projection", projection);
    shader.setMat4("model", model);
    shader.setVec3("objectColor", 1.0, 0.5, 0.31);
    shader.setVec3("ambientColor", 1.0, 1.0, 1.0);
    shader.setVec3("lightColor", 1.0, 1.0, 1.0);
    shader.setVec3("lightPos", lightPos);
    shader.setVec3("cameraPos", camera.position);
    gl!.drawArrays(gl!.TRIANGLES, 0, 36)
    this.processInput()
    requestAnimationFrame(this.tick)
  }
  fullscreenChange() {
    //@ts-ignore
    if (document.webkitFullscreenElement === this.$el ||
      //@ts-ignore
      document.mozFullscreenElement === this.$el ||
      //@ts-ignore
      document.mozFullScreenElement === this.$el) { // 较旧的 API 大写 'S'.
      // 元素进入全屏模式了，现在我们可以请求指针锁定。
      this.$el.requestPointerLock = this.$el.requestPointerLock ||
        this.$el.mozRequestPointerLock ||
        this.$el.webkitRequestPointerLock;
      this.$el.requestPointerLock();
    } else {

    }
  }
  pointerLockChange() {
    //@ts-ignore
    if (
      document.pointerLockElement === this.$el ||
      //@ts-ignore
      document.mozPointerLockElement === this.$el ||
      //@ts-ignore
      document.webkitPointerLockElement === this.$el) {
      this.isControlling = true
      console.log("指针锁定成功了。");
    } else {
      this.isControlling = false
      console.log("指针锁定已丢失。");

    }
  }
  lockPointer() {
    this.$el.requestPointerLock = this.$el.requestPointerLock ||
      this.$el.mozRequestPointerLock ||
      this.$el.webkitRequestPointerLock;
    this.$el.requestPointerLock();

  }
  mounted() {

    let canvas: HTMLCanvasElement

    document.addEventListener('pointerlockchange', this.pointerLockChange, false);
    document.addEventListener('mozpointerlockchange', this.pointerLockChange, false);
    document.addEventListener('webkitpointerlockchange', this.pointerLockChange, false);

    function pointerLockError() {
      console.log("锁定指针时出错。");
    }

    document.addEventListener('pointerlockerror', pointerLockError, false);
    document.addEventListener('mozpointerlockerror', pointerLockError, false);
    document.addEventListener('webkitpointerlockerror', pointerLockError, false);


    canvas = this.canvas = (this.$el as HTMLElement).querySelector(
      'canvas'
    ) as HTMLCanvasElement
    // 初始化WebGL上下文
    const gl = this.gl = this.canvas.getContext('webgl')
    if (!gl) {
      alert('无法初始化WebGL，你的浏览器、操作系统或硬件等可能不支持WebGL。')
      return
    }
    this.shader = new Shader(gl, vs, fs)
    const buffers = initBuffers(gl)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers)

    this.camera = new Camera(gl, [0, 0, 3])
    window.addEventListener('mousedown', this.lockPointer)
    window.addEventListener('mousemove', this.handleMouseEvent)
    window.onkeydown = window.onkeyup = this.handleKeyboardEvent

    this.tick()
  }
}
</script>

<style>
</style>
