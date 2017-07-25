'use strict'

import {
  PerspectiveCamera,
  BoxGeometry,
  Context,
  ShaderLib,
  Shader,
  Frame,
  MaterialX,
  MeshXAttributes,
  MeshX,
  Mesh,
} from '../../src'

import glsl from 'glslify'
import ready from 'domready'
import Stats from 'stats.js'
import quat from 'gl-quat'
import vec3 from 'gl-vec3'

const ctx = new Context()

const material = new MaterialX(ctx)
const geometry = new BoxGeometry()
const vertexShader = new Shader(ctx)
const fragmentShader = new Shader(ctx)
const camera = new PerspectiveCamera(ctx)
const frame = new Frame(ctx)
const stats = new Stats()
const box = new MeshX(ctx, {geometry})

ready(() => document.body.appendChild(stats.dom))
frame(() => stats.begin())
frame(scene)
frame(() => stats.end())

vertexShader({
  vertexShader: glsl`
  #include <camera/camera>
  #include <mesh/vertex>
  #include <mesh/mesh>

  #include <camera/uniforms>
  #include <mesh/uniforms>

  #include <varying/color>
  #include <varying/emit>

  #include <vertex/attributes/position>
  #include <vertex/attributes/normal>
  #include <vertex/main>

  void Main(inout vec4 vertexPosition, inout VaryingData data) {
    data.color = vec4(0.2, 0.4, 0.5, 1.0);
    vertexPosition = MeshVertex(
      camera.projection,
      camera.view,
      mesh.model,
      position);
  }
  `,

})

fragmentShader({
  fragmentShader: glsl`
  #include <mesh/fragment>
  #include <texture/2d>

  #include <texture/uniforms>
  #include <varying/color>
  #include <varying/read>

  #define GLSL_FRAGMENT_MAIN_TRANSFORM Transform

  #include <fragment/main>
  uniform float time;
  void Main(inout vec4 fragColor, inout VaryingData data) {
    fragColor = MeshFragment(data.color);
  }

  void Transform(inout vec4 fragColor, inout VaryingData data) {
    fragColor.r = 1.0/cos(0.2*time);
  }
  `
})

function scene({time}) {
  camera({position: [5, 5, -5]}, () => {
    material(() => {
      fragmentShader(() => {
        vertexShader(() => {
          box()
        })
      })
    })
  })
}
