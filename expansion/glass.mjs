import * as THREE from "../../build/three.module.js";
import { OrbitControls } from "../../examples/jsm/controls/OrbitControls.js";
import { TeapotGeometry } from "../../examples/jsm/geometries/TeapotGeometry.js";

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
    this._setupControls();

    window.onresize = this.resize.bind(this);
    this.resize();

    requestAnimationFrame(this.render.bind(this));
  }

  _setupCamera() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.set(0, 1, 2);
    this._camera = camera;
    this._scene.add(camera);
  }

  _setupLight() {
    this._scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const light = new THREE.DirectionalLight(0xffffff, 5);

    this._camera.add(light);
  }

  _setupControls() {
    new OrbitControls(this._camera, this._divContainer);
  }

  _setupBackground() {
    const loader = new THREE.TextureLoader();

    loader.load("../images/je_gray_02.jpg", (texture) => {
      const renderTarget = new THREE.WebGLCubeRenderTarget(
        texture.image.height
      );
      renderTarget.fromEquirectangularTexture(this._renderer, texture);
      this._scene.background = renderTarget.texture;
      this._setupModel();
    });
  }

  _setupModel() {
    const renderTargetOption = {
      format: THREE.RGBFormat, //rgb형식
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter, //렌더링 품질 향상
    };

    const teapotRenderTarget = new THREE.WebGLCubeRenderTarget(
      248,
      renderTargetOption
    );

    teapotRenderTarget._pmremGen = new THREE.PMREMGenerator(this._renderer);

    const teapotCamera = new THREE.CubeCamera(0.01, 1000, teapotRenderTarget);

    const teapotGeometry = new TeapotGeometry(0.7, 6);

    const teapotMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      envMap: teapotRenderTarget.texture, //유리재질 반사 환경 맵, MeshPhysicalMetarial의 envMap속성은 pmrem형식의 데이터로 지정되어야 함
      roughness: 0.05,
      ior: 2.5, //유리재질 속성, 굴절률이다 1(진공매질), 1.00029(공기매질), 1.333(물매질), 1.4 ~ 1.7(유리매질), 2.419(다이아몬드 매질)이다
      thickness: 0.2, //유리재질 속성, 두께 값이 클수록 유리 뒤에 물체를 유리를 통해 보면 더 왜곡 되어 보인다.
      transmission: 1, //유리재질 속성, 광학적인 투명도 1일때 광학적으로 완전한 투명도 0일때 광학적으로 완전한 불투명도이다. 기본값은 0이다.
      side: THREE.DoubleSide,
    });

    const teapot = new THREE.Mesh(teapotGeometry, teapotMaterial);
    teapot.add(teapotCamera);
    this._scene.add(teapot);
    this._teapot = teapot;

    const cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.2, 2, 24);
    const cylinderMaterial = new THREE.MeshNormalMaterial();
    const cylinderPivot = new THREE.Object3D();
    for (let deg = 0; deg < 360; deg += 45) {
      const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
      const radian = THREE.Math.degToRad(deg);
      cylinder.position.set(2 * Math.sin(radian), 0, 2 * Math.cos(radian));
      cylinderPivot.add(cylinder);
    }
    this._scene.add(cylinderPivot);
    this._cylinderPivot = cylinderPivot;
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

    if (this._teapot) {
      this._teapot.visible = false; //무한반복 방지
      const teapotCamera = this._teapot.children[0]; //teapotCamera = cubeCamera 객체
      const renderTarget = teapotCamera.renderTarget._pmremGen.fromCubemap(
        teapotCamera.renderTarget.texture
      ); //update 메서드에서 만든 큐브맵 이미지를 pmrem형식으로 변환
      teapotCamera.update(this._renderer, this._scene); //큐브 카메라를 통해서 주변 장면에 대한 이미지를 새롭게 업데이트
      this._teapot.material.envMap = renderTarget.texture; //pmrem텍스쳐를 주전자 재질의 환경맵(envMap)으로 지정
      this._teapot.material.needsUpdate = true; //재질의 업데이트를 하도록 설정
      this._teapot.visible = true;
    }

    if (this._cylinderPivot) {
      this._cylinderPivot.rotation.y = Math.sin(time / 2);
    }
  }
}

window.onload = function () {
  new App();
};
