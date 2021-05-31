precision mediump float;
attribute vec3 aPos;
attribute  vec3 aNormal;
varying  vec4 vertexColor;
varying  vec3 normal;
varying  vec3 FragPos;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
void main()
{
    // 注意乘法要从右向左读
    gl_Position = projection * view * model * vec4(aPos, 1.0);
    normal = mat3(model) *  aNormal;
    FragPos = vec3(model * vec4(aPos,1.0));
}