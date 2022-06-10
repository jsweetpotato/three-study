import * as THREE from '../build/three.module.js';
import { OrbitControls } from '../examples/jsm/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from '../examples/jsm/lights/RectAreaLightUniformsLib.js';
import {RectAreaLightHelper} from '../examples/jsm/helpers/RectAreaLightHelper.js'

class App{
  constructor() {
    const divContainer = document.querySelector('#webgl-container');
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

    //PerspectiveCamera 퍼스펙티브 카메라, 4개의 인자값(fovy, aspect, zNear, zFar)이 필요하다
    // fovy값은 절두체의 높이 방향에 대한 각도
    // aspect는 절두체의 가로길이를 세로 길이로 나눈 비율, zNear와 zFar는 카메라로부터의 거리
    //zNear와 zFar 거리 사이에 존재하는 물체의 일부만 렌더링되고 이 영역에서 벗어나면 렌더링되지 않는다.절두체 참고☆
    const camera = new THREE.PerspectiveCamera(
      75, //fovy 단위는 라디안(radian)이 아닌 도(degree)이다
      width / height, //3차원장면이 출력되는 DOM요소의 가로와 세로에 대한 비율이다.
      0.8,
      100
    );

    // //OrthographicCamera 오쏘그래픽카메라, 6개의 인자값(xLeft, xRight, yTop, yBottom, zNear, zFar)이 필요하다
    // //PerscpectiveCamera와 다르게 원금감없이 렌더링 된다.
    // //xLeft와 xRight는 원점을 기준으로 수평축에 대한 좌표값이다
    // //yTop과 yBottom은 원점을 기준으로 수직축에 대한 좌표값이다
    // //
    // const aspect = window.innerWidth / window.innerHeight;
    // const camera = new THREE.OrthographicCamera(
    //   -1 * aspect, 1 * aspect, //xLeft, xRight aspect를 곱해주는 이유는 렌더링 결과가 표시되는 DOM요소의 크기에 대한 종횡비를 적용시켜 자연스러운 결과를 얻기 위함
    //   1, -1, //yTop, yBottom
    //   0.1, 100 //zNear, zFar
    // )
    // camera.zoom = 0.1;

    camera.position.set(20, 20, 0);//공통 속성
    camera.lookAt(0, 0, 0);//공통속성
    this._camera = camera;
  }

  _setupLight() {
    const light2 = new THREE.HemisphereLight(0xb8d8f5, 0xbb7a1c, 0.5);

    RectAreaLightUniformsLib.init();
    const light = new THREE.RectAreaLight(0xffffff, 15, 10, 1);
    light.position.set(0, 10, 0);
    light.rotation.x = THREE.Math.degToRad(-90);

    const helper = new RectAreaLightHelper(light);
    light.add(helper);

    this._scene.add(light);
    this._scene.add(light2);
    this._lightHelper = helper;
    this._light = light;
  }

  _setupControls() {
    new OrbitControls(this._camera, this._divContainer);
  }

  _setupModel() {
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c6e7e,
      roughness: 0.5,
      metalness: 0.5,
      side: THREE.DoubleSide
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = THREE.Math.degToRad(-90);
    this._scene.add(ground);

    const bigSphereGeometry = new THREE.SphereGeometry( 3, 64, 64,0, Math.PI);
    const bigSphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.2
    });
    const bigSphere = new THREE.Mesh(bigSphereGeometry, bigSphereMaterial);
    bigSphere.rotation.x = THREE.Math.degToRad(-90);
    this._scene.add(bigSphere);
    
    const smallSpherePivot = new THREE.Object3D();
    this._scene.add(smallSpherePivot);
    
  
    const torusGeometry = new THREE.TorusGeometry(1.5, 0.5, 14, 24);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0x9b59b6,
      roughness: 0.5,
      metalness: 0.9
    });

    for (let i = 0; i < 8; i++){
      const torusPivot = new THREE.Object3D();
      const torus = new THREE.Mesh(torusGeometry, torusMaterial);
      torusPivot.rotation.y = THREE.Math.degToRad(45 * i);
      torus.position.set(8, 2, 0);
      torusPivot.add(torus);
      this._scene.add(torusPivot);
      console.log(torusPivot.children);
    }

    const smallSphereGeometry = new THREE.SphereGeometry(1, 20, 20);
    const smallSphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xe74c3c,
      roughness: 0.2,
      metalness: 0.5
    });
    const smallSphere = new THREE.Mesh(smallSphereGeometry, smallSphereMaterial);
    smallSphere.position.set(8, 2, 0);
    smallSpherePivot.add(smallSphere);
    smallSpherePivot.name = "smallSpherePivot";
    this._smallSpherePivot = smallSpherePivot;

    //
    const targetPivot = new THREE.Object3D();
    const target = new THREE.Object3D(); //smallSphere와 비슷한 구조이지만 Object3D이기 때문에 화면상에 렌더링되지는 않지만 scene의 구성요소로는 자리잡고 있음.
    targetPivot.add(target);
    targetPivot.name = "targetPivot";
    target.position.set(8, 2, 0);
    this._scene.add(targetPivot);
    //
  }

  // resize() {
  //   const width = this._divContainer.clientWidth;
  //   const height = this._divContainer.clientHeight;

  //   this._camera.aspect = width / height;
  // }

  resize() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;
    const aspect = width / height;

    if (this._camera instanceof THREE.PerspectiveCamera) {
      this._camera.aspect = aspect;
    } else {
      this._camera.left = -1 * aspect; // xLeft
      this._camera.right = 1 * aspect; // xRight
    }

    this._camera.updateProjectionMatrix();

    this._renderer.setSize(width, height);
  }

  render(time) {
    this._renderer.render(this._scene, this._camera);
    this.update(time);
    requestAnimationFrame(this.render.bind(this));
  }

  update(time) {
    time *= 0.001 //second unit

    const smallSpherePivot = this._scene.getObjectByName("smallSpherePivot");

    if (smallSpherePivot) {
      smallSpherePivot.rotation.y = THREE.Math.degToRad(time * 50);

      // const smallSphere = smallSpherePivot.children[0];
      // smallSphere.getWorldPosition(this._camera.position);
 
      // const targetPivot = this._scene.getObjectByName("targetPivot");
      // if (targetPivot) {
      //   targetPivot.rotation.y = THREE.Math.degToRad(time * 50 + 10);

      //   const target = targetPivot.children[0];
      //   const pt = new THREE.Vector3();
      
      //   target.getWorldPosition(pt);
      //   this._camera.lookAt(pt);
      // }
      
      if (this._light.target) {
        const smallSphere = smallSpherePivot.children[0];
        smallSphere.getWorldPosition(this._light.target.position);

        if (this._lightHelper) this._lightHelper.update();
      }
    }
  }
}

window.onload = function () {
  new App();
}