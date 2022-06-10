import * as THREE from "../../build/three.module.js";
import { OrbitControls } from "../../examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "../../examples/jsm/loaders/FBXLoader.js"

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
    camera.position.z = 4;
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
    this._conmtrols = new OrbitControls(this._camera, this._divContainer);
  }

  /**
   * _zoomFit must be executed after loading the fbx file
   * @param {loaded fbx obejct} object3D - fbx file object
   * @param {object} camera - this.camera object`
   * @param {string} viewMode - view direction X,Y,Z
   * @param {boolean} bFront - front or not
   */

  _zoomFit(object3D, camera, viewMode, bFront) {
    // 모델의 경계 박스 크기를 구함
    // THREE.Box3 => 3D 공간에서 축 정렬 경계 상자(AABB)를 나타냅니다.
    // .setFromObject ( object : Object3D , precise : Boolean ) : this object - 경계 상자를 계산할 Object3D 입니다. 정확한 - (선택 사항) 더 많은 계산을 희생하면서 가장 작은 표준 축 정렬 경계 상자를 계산합니다. 기본값은 false입니다. Object3D
    const box = new THREE.Box3().setFromObject(object3D);

    // 모델의 경계 박스 대각선 길이 구함
    const sizeBox = box.getSize(new THREE.Vector3()).length();

    // 모델의 경계 박스 중심 위치값
    const centerBox = box.getCenter(new THREE.Vector3());

    let offsetX = 0,
      offsetY = 0,
      offsetZ = 0;
    viewMode === "X"
      ? (offsetX = 1)
      : viewMode === "Y"
      ? (offsetY = 1)
      : (offsetZ = 1);

    if (!bFront) {
      offsetX *= -1;
      offsetY *= -1;
      offsetZ *= -1;
    }

    camera.position.set(
      centerBox.x + offsetX,
      centerBox.y + offsetY,
      centerBox.z + offsetZ
    );

    // 모델 크기의 절반값
    const halfSizeModel = sizeBox * 0.5;

    // 카메라 fov의 절반값
    const halfFov = THREE.Math.degToRad(camera.fov * 0.5);

    // 모델을 화면에 꽉 체우기 위한 적당한 거리
    const distance = halfSizeModel / Math.tan(halfFov);

    // 모델 중심에서 카메라 위치로 향하는 방향 단위 벡터 계산
    const direction = new THREE.Vector3()
      .subVectors(camera.position, centerBox)
      .normalize();

    // "단위 방향 벡터"방향으로 모델 중심 위치에서 distance 거리에 대한 위치 값
    const position = direction.multiplyScalar(distance).add(centerBox);

    camera.position.copy(position);

    // 모델의 크기에 맞춰 카메라의 near, far 값을 대략적으로 조정
    camera.near = sizeBox / 100;
    camera.far = sizeBox * 100;

    camera.updateProjectionMatrix();

    // 카메라가 모델의 중심을 보게 만듬
    camera.lookAt(centerBox.x, centerBox.y, centerBox.z);

    // orbitControls를 모델의 중심으로 설정
    this._conmtrols.target.set(centerBox.x, centerBox.y, centerBox.z);
  }

  _setupModel() {
    this._clock = new THREE.Clock();

    const loader = new FBXLoader();
    loader.load("../data/Jog In Circle.fbx", (object) => {
      this._mixer = new THREE.AnimationMixer(object);
      const action = this._mixer.clipAction(object.animations[0]);
      action.play();
      
      this._scene.add(object);

      this._zoomFit(object, this._camera, "Z", true);
    });
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
    time *= 0.001; // second unit

    // delta = 경과된 시간값
    const delta = this._clock.getDelta();
    if (this._mixer) this._mixer.update(delta);
  }
}

window.onload = function () {
  new App();
};
