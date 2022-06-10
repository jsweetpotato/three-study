import * as THREE from "../../build/three.module.js";
import { OrbitControls } from "../../examples/jsm/controls/OrbitControls.js";

class Particle {
  constructor(scene, geometry, material, x, y) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, 0);
    scene.add(mesh);
    mesh.wrapper = this; //생성한 mesh의 wrapper속성에 Particle객체를 저장
    this.awakenTime = undefined;
    this._mesh = mesh;
  }

  awake(time) {
    if (!this.awakenTime) {
      this.awakenTime = time;
    }
  }

  update(time) {
    //마우스로 큐브를 건드리면 awakenTime이 지정된다
    if (this.awakenTime) {
      //큐브가 움직이는 시간(값)을 period로 지정
      const period = 6.0;

      //현재 시간과 awake메서드가 호출되었을 때의 시간차를 구한다
      const t = time - this.awakenTime; //t변수의 단위는 second(초)단위이다

      //만약  t가 period보다 크면 awakenTime속성값을 무효화 시키고 더이상 update메서드 내부코드를 실행하지 않도록 한다
      if (t >= period) this.awakenTime = undefined;

      this._mesh.rotation.x = THREE.Math.lerp(
        0,
        Math.PI * 2 * period,
        t / period
      );

      //색상값 지정
      let h_s, l;
      if (t < period / 2) {
        //처음 절반 동안의 hsl값
        h_s = THREE.Math.lerp(0.0, 1.0, t / (period / 2));
        l = THREE.Math.lerp(0.1, 1.0, t / (period / 2));
      } else {
        //남은 절반 동안의 hsl값
        h_s = THREE.Math.lerp(1.0, 0.0, t / (period / 2.0) - 1);
        l = THREE.Math.lerp(1.0, 0.1, t / (period / 2.0) - 1);
      }
      //hsl값을 mesh의 material의 color값에 지정
      this._mesh.material.color.setHSL(h_s, h_s, l);

      //큐브를 z축 방향으로 h_s값 하나를 이용해 이동시킴, h_s값은 0~1사이 값이므로 큐브는 period값인 12초동안 z축으로 0에서 15위치로 이동된다.
      this._mesh.position.z = h_s * 9.0;
    }
  }
}

class App {
  constructor() {
    const divContainer = document.querySelector("#webgl-container");
    this._divContainer = divContainer;

    const renderer = new THREE.WebGL1Renderer({
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    divContainer.appendChild(renderer.domElement);
    this._renderer = renderer;

    const scene = new THREE.Scene();
    this._scene = scene;

    this._setupCamera();
    this._setupLight();
    this._setupBackground();
    this._setupModel();
    this._setupControls();
    this._setupPicking();

    window.onresize = this.resize.bind(this);
    this.resize();

    requestAnimationFrame(this.render.bind(this));
  }

  _setupCamera() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 40;
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

  _setupPicking() {
    //Raycast 객체 생성을 한다 (Raycast: 눈에 보이지 않는 광선(ray)를 쏴서 해당 광선에 맞는 물체가 무엇인지 여부를 판단한 뒤 여라가지 후처리를 하는방식)
    //이 강의 에서는 카메라 위치에서 출발해서 마우스 커서의 위치 방향으로 직진하는광선을 생성
    //이 광선과 충돌하는 mesh를 알 수 있다. 이때 광선과 충돌한 mesh가 마우스 커서 위치에 놓인 큐브라고 판단할 수 있다.
    const raycaster = new THREE.Raycaster();
    raycaster.cursorNormalizePoisition = undefined; //현재 마우스 위치를 저장위치 생성, undefined로 지정
    this._divContainer.addEventListener(
      "mousemove",
      this._onMouseMove.bind(this)
    ); //마우스 이동 이벤트에서 마우스 위치값을 지정, 이를 위해 마우스 이벤트 생성
    this._raycaster = raycaster;
  }

  _onMouseMove() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;

    //THREE.js에서는 picking을 위해서 마우스 커서의 위치를 -1 ~ 1사이의 값으로 정규화 되어야 한다.
    const x = (event.offsetX / width) * 2 - 1;
    //y값의 경우 -로 지정한 이유는, 일반적인 화면에서 y좌표는 아래쪽으로 증가하는데 반해 THREE.js에서 y좌표는 위쪽 방향으로 증가하기때문이다.
    const y = -(event.offsetY / height) * 2 + 1;

    this._raycaster.cursorNormalizePoisition = { x, y };
  }

  _setupBackground() {
    this._scene.background = new THREE.Color(0x3d3d3d);
  }

  _setupModel() {
    const geometry = new THREE.BoxGeometry();

    for (let x = -20; x <= 20; x += 1.1) {
      for (let y = -20; y <= 20; y += 1.1) {
        const color = new THREE.Color();
        color.setHSL(0, 0, 0.1); //HSL Hue(색상/색조), Saturation(채도), Lightness(명도) 각각의 값은  0 ~ 1까지의 값을 가진다
        const material = new THREE.MeshStandardMaterial({ color });

        new Particle(this._scene, geometry, material, x, y); //scene과 큐브에 대한 지오메트리, 재질, 큐브의 위치인 x, y값을 생성자에 전달해서 파티클 객체를 생성한다.
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

    if (this._raycaster && this._raycaster.cursorNormalizePoisition) {
      //유효검사를 통과하면 picking을 위한 광선을 생성
      this._raycaster.setFromCamera(
        this._raycaster.cursorNormalizePoisition,
        this._camera
      );
      //광선과 교차하는 객체를 얻어옴
      const targets = this._raycaster.intersectObjects(this._scene.children);
      //교차하는 객체가 1개 이상이라면 첫번째 객체를 얻어옴
      if (targets.length > 0) {
        //첫번쨰 객체가 카메라를 기준으로 가장 가까운 객체이다
        const mesh = targets[0].object;
        //마우스 커서가 mesh에 닿으면 해당 mesh를 움직여야 함 -> mesh객체가 아닌 이 mesh객체를 생성했던 Particle객체에 접근해야 함
        //이를 위해 자신을 생성했던 Particle객체를 속성으로 저장하면 된다
        //밑의 코드를 입력하면 mesh에 연결된 Particle객체에 접근할 수 있다
        const particle = mesh.wrapper;
        //Particle에 awake메서드를 time인자를 넘겨 호출
        particle.awake(time);
      }
    }

    this._scene.traverse((obj3d) => {
      if (obj3d instanceof THREE.Mesh) {
        obj3d.wrapper.update(time);
      }
    });
  }
}

window.onload = function () {
  new App();
};
