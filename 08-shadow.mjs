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
    renderer.shadowMap.enabled = true; //렌저러 객체에 그림자 맵 활성화
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
    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.8,
      100
    );
    camera.position.set(15, 15, 0);
    this._camera = camera;
  }

  _setupLight() {
    //three.js에서 그림자를 제공하는 광원은 DirectionalLight와 PointLight, SpotLight이다.
    //three.js에서 그림자를  렌더링하기 위해서는 세가지 객체에 대한 설정(렌더러, 광원, 모델)이 필요하다.
    //그림자를 지원하는 광원은 모두 shadow라는 속성을 갖는다.
    //이 shadow 속성에는 camera속성이 존재하는데, 이 camera가 그림자에 대한 텍스쳐 이미지를 생성하기 위해서 사용된다.

    const auxLight = new THREE.DirectionalLight(0xffffff, 0.5);
    auxLight.position.y = 5;
    auxLight.target.position.set(0, 0, 0);
    this._scene.add(auxLight);
    this._scene.add(auxLight.target);

    // //------------------DirectionalLight------------------
    // //DirectionalLight의 그림자를 위한 카메라는 OrthographicCamera이며 카메라의 절두체를 벗어나는 객체는 모두 짤려 나가게 된다.
    // const light = new THREE.DirectionalLight(0xffffff, 0.5);
    // light.position.y = 10;
    // light.target.position.set(0, 0, 0);
    // this._scene.add(light.target);

    
    // //그림자 카메라 재조정 코드 
    // light.shadow.camera.top = light.shadow.camera.right = 10;
    // light.shadow.camera.bottom = light.shadow.camera.left = -10;
    
    // //-----------------------PointLight-----------------
    // const light = new THREE.PointLight(0xffffff, 1);
    // light.position.set(0, 10, 0);

    //--------------------------SpotLight---------------------
    const light = new THREE.SpotLight(0xffffff, 1);
    light.position.set(0, 10, 0);
    light.target.position.set(0, 0, 0);
    light.angle = THREE.Math.degToRad(30);
    light.penumbra = 0.1;
    this._scene.add(light.target);
    
    const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
    this._scene.add(cameraHelper);

    //그림자는 텍스쳐 맵핑 이미지를 이용해 표현된다. 기본적으로 이 텍스쳐 맵핑 이미지의 크기는 가로와 세로 모두 512이다. 값이 높아지면 그림자 품질이 향상된다.
    light.shadow.mapSize.width = light.shadow.mapSize.height = 512;
    
    //그림자 외곽 블러 기본값은 1
    light.shadow.radius = 1;

    this._scene.add(light);
    this._light = light;
    light.castShadow = true; //그림자효과 활성화 여부
  }

  _setupControls() {
    new OrbitControls(this._camera, this._divContainer);
  }

  _setupModel() {
    const groundGeometry = new THREE.PlaneGeometry(24, 24);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
      roughness: 0.5,
      metalness: 0.5,
      side: THREE.DoubleSide
    });

    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = THREE.Math.degToRad(-90);
    ground.receiveShadow = true; //그라운드에 그림자를 받아 그림자를 표현함
    this._scene.add(ground);

    const bigSphereGeometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 64, 2, 3);
    const bigSphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.2
    });
    const bigSphere = new THREE.Mesh(bigSphereGeometry, bigSphereMaterial);
    bigSphere.position.set(0, 2, 0);
    bigSphere.receiveShadow = true; //빅스피어에 그림자를 받아 그림자를 표현함
    bigSphere.castShadow = true; //빅스피어가 그림자를 줌
    this._scene.add(bigSphere);
    
    const smallSpherePivot = new THREE.Object3D();
    this._scene.add(smallSpherePivot);
    
  
    const torusGeometry = new THREE.TorusGeometry(1, 0.3, 14, 24);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0x9b59b6,
      roughness: 0.5,
      metalness: 0.9
    });

    for (let i = 0; i < 8; i++){
      const torusPivot = new THREE.Object3D();
      const torus = new THREE.Mesh(torusGeometry, torusMaterial);
      torusPivot.rotation.y = THREE.Math.degToRad(45 * i);
      torus.position.set(4, 1, 0);
      torusPivot.add(torus);
      torus.receiveShadow = true; //톨로스에 그림자 받아 그림자 표현
      torus.castShadow = true;//톨로스가 그림자를 줌
      this._scene.add(torusPivot);
      console.log(torusPivot.children);
    }

    const smallSphereGeometry = new THREE.SphereGeometry(0.8, 20, 20);
    const smallSphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xe74c3c,
      roughness: 0.2,
      metalness: 0.5
    });
    const smallSphere = new THREE.Mesh(smallSphereGeometry, smallSphereMaterial);
    smallSphere.position.set(4, 1, 0);
    smallSphere.receiveShadow = true;
    smallSphere.castShadow = true;
    smallSpherePivot.add(smallSphere);
    smallSpherePivot.name = "smallSpherePivot";
    this._smallSpherePivot = smallSpherePivot;

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
    time *= 0.001 //second unit

    const smallSpherePivot = this._scene.getObjectByName("smallSpherePivot");

    if (smallSpherePivot) {
      smallSpherePivot.rotation.y = THREE.Math.degToRad(time * 50);
    
      if (this._light.target) {
        const smallSphere = smallSpherePivot.children[0];
        smallSphere.getWorldPosition(this._light.target.position);

        if (this._lighthelper) this._lighthelper.update();
      }
      //PointLight
      if (this._light instanceof THREE.PointLight) {
        const smallSphere = smallSpherePivot.children[0];
        smallSphere.getWorldPosition(this._light.position);
      }

    }
  }
}

window.onload = function () {
  new App();
}