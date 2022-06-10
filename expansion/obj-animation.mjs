import * as THREE from "../../build/three.module.js";
import { OrbitControls } from "../../examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "../../examples/jsm/loaders/OBJLoader.js"

const vertex = `
uniform float time;
uniform float radius;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

float PI = 3.141592653589793238;

void main()	{
    vNormal = normalize(normalMatrix * normal);
    float delta = (fract(time*0.001)*0.5);
    vec3 v = position * radius;
    vec3 pos = mix(position, v, delta);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    vUv = uv;
}
`;

const fragment = `
uniform float time;
uniform float progress;
uniform sampler2D texture;
uniform vec4 resolution;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main(){
  vec2 st = gl_FragCoord.xy/resolution.xy;
  st.x *= resolution.x/resolution.y;

  vec3 color = vec3(vNormal.x + abs(sin(time*0.002)*0.2+.6),0.1,.2);

  gl_FragColor =  vec4(color,1.0);
}
`;

class App {
  constructor() {
    const divContainer = document.querySelector("#webgl-container");
    this._divContainer = divContainer;

    const renderer = new THREE.WebGL1Renderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    divContainer.appendChild(renderer.domElement);
    this._renderer = renderer;

    const scene = new THREE.Scene();
    this._scene = scene;

    this._setupCamera();
    this._setupLight();
    this._setupModel();
    this._setupControls();

    window.onresize = this.resize.bind(this);
    this.resize();

    requestAnimationFrame(this.render.bind(this));
  }

  _setupCamera() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = 6;
    this._camera = camera;
    this._scene.add(this._camera);
  }

  _setupLight() {
    const color = [0xffffff, 0x0aafff];
    const intensity = 2;
    const light = new THREE.DirectionalLight(color[0], intensity);
    light.position.set(-1, 2, 4);
    this._camera.add(light);
  }

  _setupControls() {
    this._controls = new OrbitControls(this._camera, this._divContainer);
    this._controls.rotateSpeed = 0.9;
    this._controls.enableDamping = true;
    this._controls.dampingFactor = 0.1;
  }

  _setupModel() {
    this._clock = new THREE.Clock();

    const mat = new THREE.ShaderMaterial({
      // side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 1 },
        // progress: { type: "f", value: 0 },
        texture: { value: "none" },
        radius: { value: 0.9 },
        resolution: { type: "v4", value: new THREE.Vector4() },
      },
      // wireframe: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.mat = mat;

    const loader = new OBJLoader();
    loader.load("../data/heart.obj", (object) => {
      object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            child.material = mat;
        }
    });

      this._scene.add(object);
    });
  }

  resize() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;

    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();

    this._renderer.setSize(width, height);
  }

  render() {
    this._renderer.render(this._scene, this._camera);
    requestAnimationFrame(this.render.bind(this));
    this.mat.uniforms.time.value = performance.now();
    this._controls.update();
  }

}

window.onload = function () {
  new App();
};
