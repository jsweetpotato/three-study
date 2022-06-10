import * as THREE from '../build/three.module.js';
import { OrbitControls } from '../examples/jsm/controls/OrbitControls.js';
import {VertexNormalsHelper} from '../examples/jsm/helpers/VertexNormalsHelper.js'

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
      0.1,
      100
    );
    camera.position.z = 2;
    // camera.position.x = -10;
    this._camera = camera;
  }

  _setupLight() {
    const color = [0xfadf69, 0x0aafff];
    const intensity = 2;
    const light = new THREE.DirectionalLight(color[0], intensity);
    const light2 = new THREE.DirectionalLight(color[1], intensity);
    light.position.set(-1, 2, 4);
    light2.position.set(1, -2, -4);
    this._scene.add(light, light2);
  }

  _setupControls() {
    new OrbitControls(this._camera, this._divContainer);
  }

  _setupModel() {
    const rawPositions = [
      -1, -1, 0,
      1, -1, 0,
      -1, 1, 0,
      1, 1, 0
    ];

    const rawNormals = [
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1
    ]; //mesh의 면으로 봤을 때 면에 대한 수직인 벡터가 모두 0,0,1이기 때문이다.

    const rawColors = [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
      1, 1, 0
    ];

    const rawUVs = [
      0, 0,
      1, 0,
      0, 1,
      1, 1
    ];
    
    const positions = new Float32Array(rawPositions); 
    const normals = new Float32Array(rawNormals); 
    const colors = new Float32Array(rawColors);
    const uvs = new Float32Array(rawUVs); //32비트 부동소수점 (c언어)배열을 생성한다는 메서드
    

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3)); //첫번쨰 인자로 position값 지정 두번쨰 인자로 BufferAttribute 클래스를 통해 앞에 랩핑해 둔 정점 데이터를 지정함,하나의 정점이 3개의 항목(x,y,z)으로 구성되기때문에 3으로 지정
    geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3)); //법선 벡터 지정
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3)); //각 벌텍스에 컬러 지정
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2)); //2인 이유는 uv는 2개의 값이 하나의 uv좌표를 구성하기 때문
  
    geometry.setIndex([
      0, 1, 2,
      2, 1, 3
    ]); //주의!! 정점 인덱스를 지정할 때 삼각형을 구성하는 정점의 배치 순서가 반시계 방향이어야 한다. 참고로 index는 0이 시작값이므로 첫번째 index는 0이 된다.

   // geometry.computeVertexNormals(); 법선 벡터 자동 계산 코드

    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load("../examples/textures/uv_grid_opengl.jpg")
    
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff, vertexColors: true, map: map});

    const box = new THREE.Mesh(geometry, material);
    this._scene.add(box);

    const helper = new VertexNormalsHelper(box, 0.1, 0xffff00);
    this._scene.add(helper);
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

    // this._cube.rotation.x = time;
    // this._cube.rotation.y = time;
  }
}

window.onload = function () {
  new App();
}