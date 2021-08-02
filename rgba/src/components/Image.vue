<template>
  <div>
    <canvas id="canvas">
    </canvas>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import { Watch, Prop } from 'vue-property-decorator'
import vs from 'raw-loader!../public/vs.vs'
import fs from 'raw-loader!../public/fs.fs'
import Shader from '../shader'
import { destroyed } from '../../../../cocos/cocos/source/panel/project/components/list';

export default class WebGLImage extends Vue {
  gl!: WebGLRenderingContext | null;
  canvas!: HTMLCanvasElement;
  shader!: Shader;

  @Prop({ type: String })
  src: String = '';

  image!: HTMLImageElement;

  textureBuffer?: WebGLTexture | null;

  @Prop({ type: Number })
  index: 0 | 1 | 2 | 3 = 0;

  @Watch('index')
  onIndexChange() {
    if (this.image && this.image.complete) {
      this.renderMyTexture(this.image)

    }
  }

  mounted() {
    this.canvas = document.querySelector('#canvas') as HTMLCanvasElement
    const gl = this.gl = this.canvas.getContext('webgl')
    if (!gl) {
      alert('无法初始化WebGL，你的浏览器、操作系统或硬件等可能不支持WebGL。')
      return
    }
    const image = this.image = document.querySelector('#image') as HTMLImageElement;
    image.onload = () => {
      console.log('onload');
      this.init(image);
      this.renderMyTexture(image);
    }
  }
  loadImage(url: string, callback: HTMLImageElement['onload']) {
    var image = new Image()
    image.onload = callback;
    image.src = url;
    return image;
  }
  // const currentTextureValid= this.textureBuffer instanceof WebGLTexture && gl.isTexture(this.textureBuffer)
  //     if (image == this.image && currentTextureValid) {
  //       return this.textureBuffer;
  //     } else {
  // 			if(currentTextureValid){
  // 				gl.deleteTexture(this.textureBuffer as WebGLTexture);
  // 			}
  activeTexture(gl: WebGLRenderingContext, textureBuffer: WebGLTexture, textureIndex: number = gl.TEXTURE0) {
    gl.activeTexture(textureIndex);
    gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
    //unbind
    gl.activeTexture(gl.TEXTURE0);

  }

  generateTexture(gl: WebGLRenderingContext, image: HTMLImageElement) {
    //创建纹理缓冲
    let texture = gl.createTexture();
    //绑定纹理
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    return texture;
  }

  init(image: HTMLImageElement) {
    const canvas = this.canvas;
    const gl = this.gl as WebGLRenderingContext;
    canvas.width = image.width;
    canvas.height = image.height;
    const shader = this.shader = new Shader(gl, vs, fs)
    // setup GLSL program
    let program = shader.program as WebGLProgram;
    // look up where the vertex data needs to go.
    let positionLocation = gl.getAttribLocation(program, "a_position");
    let texcoordLocation = gl.getAttribLocation(program, "a_texCoord");
    let positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Set a rectangle the same size as the image.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 0,
      image.width, 0,
      0, image.height,
      0, image.height,
      image.width, 0,
      image.width, image.height,
    ]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // 申请uv的缓冲
    let texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    // 往缓冲区注入uv数据
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0,
    ]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    // 删除纹理缓冲
    if (this.textureBuffer && gl.isTexture(this.textureBuffer)) {
      gl.deleteTexture(this.textureBuffer);
    }
    //创建纹理缓冲
    let texture = this.textureBuffer = this.generateTexture(gl, image);
    //启用纹理
    this.activeTexture(gl, texture as WebGLTexture);
    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(texcoordLocation);

  }

  renderMyTexture(image: HTMLImageElement) {
    const canvas = this.canvas;
    const gl = this.gl as WebGLRenderingContext;
    canvas.width = image.width;
    canvas.height = image.height;
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    this.shader.use()
    this.shader.setVec2("u_resolution", gl.canvas.width, gl.canvas.height);
    this.shader.setUniform("u_index", this.index)
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  beforeUnmount() {
    if (this.gl && this.textureBuffer && this.gl.isTexture(this.textureBuffer)) {
      this.gl.deleteTexture(this.textureBuffer);
    }
  }
}

</script>

<style>
</style>
