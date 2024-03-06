#ifdef VSHADER

in vec3 inPos;
in vec3 inCol;
in vec3 position;

uniform mat4 vp_matrix;

out vec3 fragCol;

void main() {
    fragCol = inCol;
    gl_Position = vp_matrix * vec4(position + inPos, 1.0);
}
#endif

#ifdef FSHADER
precision highp float;

in vec3 fragCol;

out vec4 outColor;

void main() {
    outColor = vec4(fragCol, 1.0);
}
#endif


#ifdef CSHADER
in vec3 inPos;

out vec3 outPos;
out vec3 outCol;

uniform mat4 v_matrix;

void main() {

    vec3 world_right = vec3(v_matrix[0][0], v_matrix[1][0], v_matrix[2][0]);
    vec3 world_up = vec3(v_matrix[0][1], v_matrix[1][1], v_matrix[2][1]);

    outPos = world_right * inPos.x + world_up * inPos.y;
    outCol = vec3(1.0, 1.0, 1.0);
}
#endif