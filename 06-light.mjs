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
    // //AmbientLight 앰비언트 라이트, 생성자에 빛의 색상값과 세기값을 인자로 받음, 주변광(환경광), scene에 존재하는 모든 물체에 대해서 단일 색상으로 렌더링된다. 대부분의 경우 광원의 영향을 받지 못하는 물체도 살짝 보여지게 하기 위해 세기값을 매우 약하게 지정해서 장면에 추가한다.
    // const light = new THREE.AmbientLight(0xff00ff, 0.5); 

    //HemisphereLight 헤미스피어 라이트, 주변광(환경광), 색상값을 두개 가지는데 첫번째 인자는 위 두번째 인자는 아래에서 비치는 빛의 색상이다.
    const light2 = new THREE.HemisphereLight(0xb8d8f5, 0xbb7a1c, 0.5);

    // //DirectionalLight 디렉셔널라이트, 태양과 같은 광원, 태양처럼 빛과 물체간의 거리에 상관없이 동일한 빛의 효과를 준다, 동일한 빛의 효솨를 주기 때문에 빛의 position과 target 속성의 position으로 결정되는 방향만 의미 있음
    // const light = new THREE.DirectionalLight(0xffffff, 1);
    // light.position.set(0, 10, 0);
    // light.target.position.set(0, 0, 0);
    // this._scene.add(light.target);
    // const helper = new THREE.DirectionalLightHelper(light);
    // this._scene.add(helper);
    
    // //PointLight 포인트 라이트, 빛이 광원의 위치에서 사방으로 퍼져 나감, distance 속성값을 통해 지정된 거리까지만 광원의 영향을 받도록 설정할 수 있음, 기본값은 0
    // const light = new THREE.PointLight(0xffffff, 2);
    // light.position.set(0, 10, 0);
    // light.distance = 10;   
    // const helper = new THREE.PointLightHelper(light);
    // this._scene.add(helper);
    
    // //SpotLight 스팟라이트, 빛이 광원의 위치에서 깔대기 모양으로 퍼져 나감, angle은 광원이 만드는 깔대기의 각도, 이 값이 클수록 더 커짐, penumbra는 빛의 감쇄율, 기본값은 0으로 0~1 사이값으로 지정 가능, 1에 가까울수록 빛이 점점 감쇄됨
    // const light = new THREE.SpotLight(0xffffff, 2);
    // light.position.set(0, 14, 0);
    // light.target.position.set(0, 0, 0);
    // light.angle = THREE.Math.degToRad(20);
    // light.penumbra = 0.5;
    // this._scene.add(light.target);
    // const helper = new THREE.SpotLightHelper(light);
    // this._scene.add(helper);

    //RectAreaLight 렉트아리아라이트, 형광등이나 창문에서 들어오는 라이트, RectAreaLight와 helper를 사용하려면 RectAreaLightUniformsLib, RectAreaLightHelper를 import해야함, 첫번쨰 인자부터 색상, 밝기, 가로크기, 세로크기 값임 
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
    const groundGeometry = new THREE.PlaneGeometry(24, 24);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
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

    //target 속성이 있을 때 smallSpherePivot의 첫번째 자식을 얻어옴-> 이 smallSphere의 world좌표계의 위치를 구해서 광원의 target위치에 지정 -> 광원의 target 속성이 변경되었으므로 이 광원을 시각해주는 helper도 업데이트 해줘야 하므로 밑의 if 코드도 필요함
    if (smallSpherePivot) {
      smallSpherePivot.rotation.y = THREE.Math.degToRad(time * 50);
      
      // //DirectionalLight, SpotLight의 타겟위치 추적 
      // if (this._light.target) {
      //   const smallSphere = smallSpherePivot.children[0];
      //   smallSphere.getWorldPosition(this._light.target.position);

      //   if (this._lightHelper) this._lightHelper.update();
      // }

      // //PointLight의 위치 이동
      // if (this._light) {
      //   const smallSphere = smallSpherePivot.children[0];
      //   smallSphere.getWorldPosition(this._light.position);

      //   if (this._lightHelper) this._lightHelper.update();
      // }
    }
  }
}

window.onload = function () {
  new App();
}