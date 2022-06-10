import * as THREE from "../build/three.module.js";
import { OrbitControls } from "../../examples/jsm/controls/OrbitControls.js";

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
    this._setupBackground();
    //this._setupModel();
    this._setupControls();

    window.onresize = this.resize.bind(this);
    this.resize();

    requestAnimationFrame(this.render.bind(this));
  }

  _setupCamera() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 20;
    // camera.position.x = -10;
    this._camera = camera;
  }

  _setupLight() {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    this._scene.add(light);
  }

  _setupControls() {
    new OrbitControls(this._camera, this._divContainer);
  }

  _setupBackground() {
    //정방형맵 배경
    const loader = new THREE.TextureLoader();

    loader.load("./images/je_gray_02.jpg", (texture) => {
      const renderTarget = new THREE.WebGLCubeRenderTarget(
        texture.image.height
      );
      renderTarget.fromEquirectangularTexture(this._renderer, texture);
      this._scene.background = renderTarget.texture;
      this._setupModel();
    });

    // //큐브맵 배경
    // const loader = new THREE.CubeTextureLoader();
    // loader.load([
    //   "./images/Lycksele/posx.jpg",
    //   "./images/Lycksele/negx.jpg",
    //   "./images/Lycksele/posy.jpg",
    //   "./images/Lycksele/negy.jpg",
    //   "./images/Lycksele/posz.jpg",
    //   "./images/Lycksele/negz.jpg"
    // ], cubeTexture => {
    //   this._scene.background = cubeTexture;
    //   this._setupModel();
    // })

    // //백그라운드 이미지
    // const loader = new THREE.TextureLoader();
    // loader.load("./images/planet-alien-sky-2038601.jpg", texture => {
    //   this._scene.background = texture;
    //   this._setupModel();
    // });

    // this._scene.background = new THREE.Color(0x959595);
    // this._scene.fog = new THREE.Fog(0x9b59b6, 0, 50); //안개 클래스, 순서대로 안개색상, 안개 시작 거리, 안개가 가득 차더 더이상 메시가 보이지 않는 거리
    // this._scene.fog = new THREE.FogExp2(0x9b59b6, 0.02);//인괄적인안개처럼 카메라에 멀어질수록 점점 흐려짐, 순서대로 안개색상, 안개 강도
    //안개는 장면에 색상과 함께 지정해야 자연스럽다. 안개는 메시에서면 변경되기때문이다.
  }

  _setupModel() {
    const pmremG = new THREE.PMREMGenerator(this._renderer); //배경을 메쉬에 비치게하는 클래스
    const renderTarget = pmremG.fromEquirectangular(this._scene.background); //일반 텍스쳐 이미지,  정방형 이미지

    // const renderTarget = pmremG.fromCubemap(this._scene.background); //큐브맵 사용시

    const geometry = new THREE.SphereBufferGeometry();

    const material1 = new THREE.MeshStandardMaterial({
      color: 0x2acc71,
      roughness: 0,
      metalness: 1,
      envMap: renderTarget.texture,
    });

    const material2 = new THREE.MeshStandardMaterial({
      color: 0xed5c3c,
      roughness: 0,
      metalness: 1,
      envMap: renderTarget.texture,
    });

    const rangeMin = -3.0,
      rangeMax = 3.0;
    const gap = 5.0;
    let flag = true;

    for (let x = rangeMin; x <= rangeMax; x += gap) {
      for (let y = rangeMin; y <= rangeMax; y += gap) {
        for (let z = rangeMin * 2; z <= rangeMax; z += gap) {
          flag = !flag;

          const mesh = new THREE.Mesh(geometry, flag ? material1 : material2);
          mesh.position.set(x, y, z);
          this._scene.add(mesh);
        }
      }
    }
  }

  resize() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;

    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();

    this._renderer.setSize(width, height);
  }

  render(time) {
    this._renderer.render(this._scene, this._camera);
    this.update(time);
    requestAnimationFrame(this.render.bind(this));
  }

  update(time) {
    time *= 0.001; //second unit

    // this._cube.rotation.x = time;
    // this._cube.rotation.y = time;
  }
}

window.onload = function () {
  new App();
};
