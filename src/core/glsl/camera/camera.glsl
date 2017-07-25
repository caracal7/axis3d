#pragma glslify: export(Camera)
#ifndef GLSL_CAMERA
#define GLSL_CAMERA

struct Camera {
  mat4 projection;
  mat4 view;
};

#endif
