precision mediump float;

// our texture
uniform sampler2D u_image;
// 显示第几个通道
uniform int u_index;
// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
   vec4 color = texture2D(u_image, v_texCoord);
   vec4 result = vec4(0, 0, 0, 0);
   int i = 0;
   for(; i < 4; i++) {
      if(i == u_index) {
         i = u_index;
         break;
      }
   }
   result = vec4(color[i], color[i], color[i], 1);

   gl_FragColor = result;
}