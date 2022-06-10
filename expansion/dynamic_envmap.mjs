import * as THREE from "../../build/three.module.js";
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
    camera.position.set(0, 4, 9);
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

  _setupModel() {
    //환경 맵은 재질을 통해 지정, 종적인 환경맵은 THREE.WebGLCubeRenderTarget, THREE.CubeCamera 클래스를 통해서 생성
    //이 두클래스를 이용한 동적인 환경맵 구현을 위한 기본 개념
    //동적인 환경 맵이 적용된 메시의 윛에 큐브카메라를 위치시키고 카메라의 6개의 각 수직면에 대한 방향으로 장면을 렌더링함
    //6개의 수직면의 방향으로 렌더링된 이미지는 정육면체의 면으로 구성됨
    //바로이 6개의 큐브맵 이미지를 환경맵으로 사용해서 주변의 메시를 자신의 표면에 반사시킬 수 있음

    const renderTargetOption = {
      format: THREE.RGBFormat, //rgb형식
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter, //렌더링 품질 향상
    };

    const sphereRenderTarget = new THREE.WebGLCubeRenderTarget(
      512,
      renderTargetOption
    ); //렌더된 결과 이미지에 접근할 수 있는 클래스, 순서대로 이미지 사이즈(가로x세로), 옵션값, 더미
    const sphereCamera = new THREE.CubeCamera(0.1, 1000, sphereRenderTarget);
    const sphereGeometry = new THREE.SphereGeometry(1.5);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0xaddfff,
      envMap: sphereRenderTarget.texture,
      reflectivity: 0.95,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    //sphere.add(sphereCamera);큐브카메라의 위치를 환경맵에 적용될 메시와 동일한 곳에 위치시킴
    //메시의 대해서 회전변환 등이 발생하면 카메라도 함께 회전되어 잘못된 결과를 가져올 수 있음
    //피봇개념을 도입해서 해결 할 수 있음
    const spherePivot = new THREE.Object3D();
    spherePivot.add(sphere); //순서 중요
    spherePivot.add(sphereCamera);
    spherePivot.position.set(1, 0, 1);
    this._scene.add(spherePivot);

    const cylinderRenderTarget = new THREE.WebGLCubeRenderTarget(
      512,
      renderTargetOption
    );
    const cylinderCamera = new THREE.CubeCamera(
      0.1,
      1000,
      cylinderRenderTarget
    );
    const cylinderGeometry = new THREE.CylinderGeometry(0.5, 1, 3, 32);
    const cylinderMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffaf,
      envMap: cylinderRenderTarget.texture,
      reflectivity: 0.95,
    });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    const cylinderPivot = new THREE.Object3D();
    cylinderPivot.add(cylinder);
    cylinderPivot.add(cylinderCamera);
    cylinderPivot.position.set(-1, 0, -1);
    this._scene.add(cylinderPivot);

    const torusRenderTarget = new THREE.WebGLCubeRenderTarget(
      512,
      renderTargetOption
    );
    const torusCamera = new THREE.CubeCamera(0.1, 1000, torusRenderTarget);
    const torusGeometry = new THREE.TorusGeometry(4, 0.5, 24, 64);
    const torusMaterial = new THREE.MeshPhongMaterial({
      color: 0xffafaf,
      envMap: torusRenderTarget.texture,
      reflectivity: 0.95,
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    const torusPivot = new THREE.Object3D();
    torusPivot.add(torus);
    torusPivot.add(torusCamera);
    torus.rotation.x = Math.PI / 2; //회전은 피봇이 아닌 메시에 대해서 지정해야한다.
    this._scene.add(torusPivot);
    torus.name = "torus";

    const planeRenderTarget = new THREE.WebGLCubeRenderTarget(
      1024,
      renderTargetOption
    );
    const planeCamera = new THREE.CubeCamera(0.1, 1000, planeRenderTarget);
    const planeGeometry = new THREE.PlaneGeometry(12, 12);
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      envMap: planeRenderTarget.texture,
      reflectivity: 0.95,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    const planePivot = new THREE.Object3D();
    planePivot.add(plane);
    planePivot.add(planeCamera);
    plane.rotation.x = -Math.PI / 2; //회전은 기존 코드 그대로 사용
    planePivot.position.y = -4.8;
    this._scene.add(planePivot);
  }

  resize() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;

    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();

    this._renderer.setSize(width, height);
  }

  render(time) {
    //scene을 구성하는 요소는  obj콜백 함수를 통해 접근할 수 있다.
    this._scene.traverse((obj) => {
      if (obj instanceof THREE.Object3D) {
        const mesh = obj.children[0];
        const cubeCamera = obj.children[1];

        //해당 조건 검사 후 자기 자신에 대한 메쉬는 감추고 큐브카메라를 통해서 큐브맵 이미지를 업데이트
        //그리고 다시 메쉬를 보이게 한다
        //메쉬를 감추고 큐브맵 이미지를 업데이트 하는 이유는 메쉬에 그 자신이 반사될 경우 무한 반복 렌더링이 수행되어 오류가 발생하기 때문이다.
        if (
          mesh instanceof THREE.Mesh &&
          cubeCamera instanceof THREE.CubeCamera
        ) {
          mesh.visible = false;
          cubeCamera.update(this._renderer, this._scene);
          mesh.visible = true;
        }
      }
    });

    this._renderer.render(this._scene, this._camera);
    this.update(time);
    requestAnimationFrame(this.render.bind(this));
  }

  update(time) {
    time *= 0.001; //second unit

    const torus = this._scene.getObjectByName("torus");
    if (torus) {
      torus.rotation.x = Math.sin(time);
    }
  }
}

window.onload = function () {
  new App();
};
