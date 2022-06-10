import * as THREE from '../build/three.module.js';
import { OrbitControls } from '../examples/jsm/controls/OrbitControls.js';
import { VertexNormalsHelper } from '../examples/jsm/helpers/VertexNormalsHelper.js';

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
    camera.position.z = 3;
    this._camera = camera;
    this._scene.add(camera);
  }

  _setupLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); //모든 mesh의 전체 면에 대해서 균일하게 비추는 광원
    this._scene.add(ambientLight);

    const color = [0xffffff, 0x0aafff];
    const intensity = 1;
    const light = new THREE.DirectionalLight(color[0], intensity);
    light.position.set(-1, 2, 4);
    this._camera.add(light);
  }

  _setupControls() {
    new OrbitControls(this._camera, this._divContainer);
  }

  // _setupModel() {
  //   const vertics = [];
  //   for (let i = 0; i < 10000; i++){
  //     const x = THREE.Math.randFloatSpread(8);
  //     const y = THREE.Math.randFloatSpread(8);
  //     const z = THREE.Math.randFloatSpread(8);

  //     vertics.push(x, y, z);
  //   }

  //   const geometry = new THREE.BufferGeometry();
  //   geometry.setAttribute(
  //     "position",
  //     new THREE.Float32BufferAttribute(vertics, 3)
  //   );

  //   const sprite = new THREE.TextureLoader().load("../examples/textures/sprites/ball.png")

  //   const material = new THREE.PointsMaterial({
  //     map: sprite,
  //     alphaTest: 1, //해당 값보다 클때만 렌더링
  //     color: 0x00ffff,
  //     size: 0.1,
  //     sizeAttenuation: true //원근감에 따른 크기변화 유무
  //   });

  //   const points = new THREE.Points(geometry, material);
  //   this._scene.add(points);
  // }

  // _setupModel() {
  //   const vertices = [
  //     -1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0];
    
  //   const geometry = new THREE.BufferGeometry();
  //   geometry.setAttribute("position", new THREE.Float32Attribute(vertices, 3));

  //   const material = new THREE.LineDashedMaterial({
  //     color: 0x00ffff,
  //     dashSize: 0.2, //그려지는 선 길이
  //     gapSize: 0.1, //선 사이 간격
  //     scale: 1 //대쉬 영역 표현 배수
  //   })

  //   const line = new THREE.Line(geometry, material);
  //   line.computeLineDistances();//데쉬 라인으로 하려면 꼭 넣어야 함
  //   this._scene.add(line);
  // }

  _setupModel() {
    // 메쉬 베이직 매테리얼 - 광원에 영향을 받지 않음
    // const material = new THREE.MeshBasicMaterial({
    //   visible: true, //보일지 안보일지 정함
    //   transparent: true, //opacity값 사용 여부
    //   opacity: 0.5, //0 ~ 1까지 값, transparent를 true값으로 정해야지 사용 가능
    //   depthTest: false, //렌더링 되는 메쉬에 픽셀 위치의 z값을 depthBuffer 값을 이용해검사할지에 대한 여부
    //   depthWrite: false, //렌더링 되는 메쉬에 픽셀 위치의 z값을 depthBuffer값에 저장할 것인지 여부
    //   side: THREE.FrontSide, //렌더링 할 면 선택
    //   color: 0xffffff,
    //   wireframe: false
    // });

    // const material = new THREE.MeshLambertMaterial({
    //   transparent: true,
    //   opacity: 0.5,
    //   side:THREE.DoubleSide,
    //   color: 0x00ffff, //재질 색상 값
    //   emissive: 0x0000, //광원에 영향을 받지 않는 재질 자체에서 방출하는 색상 값
    //   wireframe:false
    // })

    // //메쉬퐁매테리얼 -> 메쉬가 렌더링 되는 픽셀 단위로 광원에 영향을 계산하는 재질
    // const material = new THREE.MeshPhongMaterial({
    //   color: 0x00ffff, //재질의 색상 값
    //   emissive: 0x0000, //다른 광원에 영향을 받지 않는 재질 자체에서 방출하는 색상값
    //   specular: 0xff0000, //광원에 의해서 반사되는 색상
    //   shininess: 10, //specular 강도
    //   flatShading: true, //메쉬를 평평하게 렌더링 할지 여부
    //   wireframe:false
    // })


    // //메쉬스탠다드매테리얼 - 많이 사용함
    // const material = new THREE.MeshStandardMaterial({
    //   color: 0x00ff00,
    //   emissive: 0x000000,
    //   roughness: 0.25, //거칠기, 값이 너무 낮으면 거울처럼 매끈한 상태기 떄문에 메탈 느낌을 제대로 낼 수 없다.
    //   metalness: 0.8, //메탈 값
    //   wireframe: false,
    //   flatShading: false
    // });

    // //메쉬 피지컬 메태리얼 - 메쉬스탠다드를 상속받고 있는 보다 발전된 물리기반 렌더링 재질(자주사용함), 재질 표면에 코팅 효과를 줄 수 있고 다눈 투명도 처리가 아닌 실제 유리같은 효과르르 표현할 수 있음
    // const material = new THREE.MeshPhysicalMaterial({
    //   color: 0xff00,
    //   emissive: 0x0000,
    //   roughness: 1,
    //   metalness: 0,
    //   clearcoat: 1, //코팅 값
    //   clearcoatRoughness: 0, //코팅의 거칠기 0(최소값) ~ 1(최대값)
    //   wireframe: 0,
    //   flatShading: false
    // });

    const textureLoder = new THREE.TextureLoader();
    // //맵핑- map속성
    // const map = textureLoder.load("../examples/textures/uv_grid_opengl.jpg", texture => {
    //   texture.repeat.x = 2; //반복 횟수
    //   texture.repeat.y = 1;

    //   texture.wrapS = THREE.ClampToEdgeWrapping; //이미지가 한번 맵핑되고 이후 반복 부터는 이미지의 끝단 픽셀로 나머지 영역을 채움
    //   texture.wrapT = THREE.ClampToEdgeWrapping;

    //   texture.wrapS = THREE.MirroredRepeatWrapping; //이미지가 거울처럼 이어져서 렌더링됨

    //   texture.offset.x = 0;
    //   texture.offset.y = 0;

    //   texture.rotation = THREE.MathUtils.degToRad(0); //매핑 회전값
    //   texture.center.x = 0;
    //   texture.center.y = 0;

    // //   texture.mapFilter = THREE.LinearFilter;
    //   texture.minFilter = THREE.NearestFilter; //mipmap을 사용하지 않고 단순히 가장 가까운 픽셀 하나를 가져와 사용함.
    //   texture.minFilter = THREE.LinearFilter; //mipmap을 사용하지 않고 원래 텍스쳐로부터 4개의 가장 가까운 픽셀을 얻어와 선형 보간한 값을 사용.
    //   texture.minFilter = THREE.NearestMipMapLinearFilter;//렝더링할 맵핑 크기와 가장 크기가 가까운 mipmap 이미지 2개를 선택하고 mipmap이미지로부터 가장 가까운 픽셀 1개씩을 얻은 뒤에 2대 픽셀의 가중치 평균값을 사용
    //   texture.minFilter = THREE.NearestMipMapNearestFilter;//렌더링할 맵핑 크기와 가장 가까운 mipmap 이미지 1개를 선택하고 가장 가까운 1개의 픽셀 값을 가져와 사용
    //   texture.minFilter = THREE.LinearMipMapNearestFilter; //레더링 할 맵핑 크기와 가장 가까운 mipmap 이미지 1개를 선택하고 가장 가까운 4개의 픽셀을 가져와서 선형 보간하여 렌더
    //   texture.minFilter = THREE.LinearMipmapLinearFilter; //렌더링할 맵핑 크기와 가장 크기가 가까운 mipmap 이미지 2개를 선택하고 각각의 mipmap 이미지에 대해 가장 가까운 픽셀 4개를 얻은 뒤에 선형 보간을 하면 2개의 색상값이 얻어지는데 이를 다시 가중치 평균한 색상값을 사용 

    //   //mipmap을 사용한 경우가 가장 렌더링 품질이 좋지만 메모리 사용향이 상당하기 때문에 사용하는 텍스쳐 맵핑의 크기 등에 따라서 적절한 minFilter 속성값을 지정해야 한다. 대부분 기본값을 사용해도 무방하다.});

    const map = textureLoder.load("images/glass/Glass_window_002_basecolor.jpg");
    const mapAO = textureLoder.load("images/glass/Glass_window_002_ambientOcclusion.jpg");
    const mapHeight = textureLoder.load("images/glass/Glass_Window_002_height.png");
    const mapNormal = textureLoder.load("images/glass/Glass_Window_002_normal.jpg");
    const mapRoughness = textureLoder.load("images/glass/Glass_Window_002_roughness.jpg");
    const mapMetailic = textureLoder.load("images/glass/Glass_Window_002_metallic.jpg");
    const mapAlpha = textureLoder.load("images/glass/Glass_Window_002_opacity.jpg");
    const mapLight = textureLoder.load("images/glass/light.jpg")

    const material = new THREE.MeshStandardMaterial({
      map: map,
      normalMap: mapNormal, //법선 벡터를 이미지화 해서 저장해 둔것이다. 법선 벡트는 mesh의 표면에 대한 수직 벡터로 광원에 대한 영향을 계산하는 사용된다.이거 쓰면 범퍼 적용 X, 실무에선 범퍼 말고 노말맵을 주로 쓴다. 지오메트리 형상이 바뀌는 것이 아니기 때문에 입체감은 착시 현상이다.

      displacementMap: mapHeight, //실제 지오메트리의 구성 좌표를 변경시킴
      displacementScale: 0.2, //변위 크기 0(최소값) ~ 1(최대값)
      displacementBias: -0.15, //변위 결과 조정 0(최소값) ~ 1(최대값)

      aoMap: mapAO, //aomap을 사용하기 위해서 ambient light가 필요함, 미리 ㅜ만들어진 세밀한 그림자와 같은 느낌의 효과를 지정할 수 있음
      aoMapintensity: 5, //aomap 세기, 기본값 1
    
      roughnessMap: mapRoughness,
      roughness: 0.5, //거칠기 값, 기본값 1

      metalnessMap: mapMetailic,
      metalness: 0.4, //메탈 값, 기본값 0

      alphaMap: mapAlpha, //픽셀값이 어두울수록 투명해짐, 투명도 값을 활성화 해줘야함
      transparent: false, //투명도 유무, 기본값 false
      side: THREE.DoubleSide,
      
      lightMap: mapLight,
      lightMapIntentsity: 2 //라이트맵 강도
    });

    const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1,60,60,60), material);
    box.position.set(-1, 0, 0);
    box.geometry.attributes.uv2 = box.geometry.attributes.uv;
    this._scene.add(box);

    // const boxhelper = new VertexNormalsHelper(box, 0.1, 0xffff00);
    // this._scene.add(boxhelper);

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.7, 60, 60), material);
    sphere.position.set(1, 0, 0);
      sphere.geometry.attributes.uv2 = sphere.geometry.attributes.uv; //ao값을 주려면 지오메트리의 속성에 uv2데이터를 지정해 줘야함.
    this._scene.add(sphere);
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
  }
}

window.onload = function () {
  new App();
}