import React from "react";
import * as THREE from "three";
import debounce from "lodash/debounce";
import gsap from "gsap";
// import OrbitControl from "three-orbit-controls";

enum CAM_MOVING_DIRECTION {
  IN,
  OUT,
}

export const CAMERA_POSITION_Y = {
  START: 5,
  ZOOM_IN: 0.1,
  ZOOM_OUT: 30,
};

const colorOption = [
  0x111111, 0x111111, 0x111111, 0x111111, 0x111111, 0x112222, 0x113333,
  0x114444, 0x335555, 0x88dddd,
];

let i = 0;
const getColor = () => {
  i = (i + 1) % colorOption.length;
  return new THREE.Color(colorOption[i]);
};

const getVectors = (num: number) => {
  const vectors = [];
  for (i = 0; i < num; i++) {
    vectors.push(
      new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize()
    );
  }
  return vectors;
};

const wrapperStyle: React.CSSProperties = {
  flex: 1,
  // padding: "3px",
  display: "flex",
  flexDirection: "column",
};
const innerStyle: React.CSSProperties = {
  flex: 1,
  overflow: "hidden",
};

let finished = false;
let stopRotate = false;

class Universe extends React.Component {
  private content;
  private scene;
  private camera;
  private renderer;
  private control;

  private camMovingDirection: CAM_MOVING_DIRECTION = CAM_MOVING_DIRECTION.IN;

  private origin = new THREE.Vector3(0, 0, 0);

  private resizeHandler = debounce(() => {
    this.camera.aspect = this.content.clientWidth / this.content.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.content.clientWidth, this.content.clientHeight);
  }, 100);

  public componentDidMount() {
    this.init();
    // this.addAxis();
    this.renderArrows();

    document.addEventListener(
      "keydown",
      (event) => {
        const { code } = event;
        if (code === "Space") {
          stopRotate = true;
          this.cameraMovingHandler();
        }
      },
      false
    );
  }

  private cameraMovingHandler() {
    if (finished) {
      location.reload();
      return;
    }

    const yPosition = {
      [CAM_MOVING_DIRECTION.IN]: CAMERA_POSITION_Y.ZOOM_IN,
      [CAM_MOVING_DIRECTION.OUT]: CAMERA_POSITION_Y.ZOOM_OUT,
    }[this.camMovingDirection];

    const duration = {
      [CAM_MOVING_DIRECTION.IN]: 2,
      [CAM_MOVING_DIRECTION.OUT]: 6,
    }[this.camMovingDirection];

    this.moveCamOnY(yPosition, duration);

    if (this.camMovingDirection === CAM_MOVING_DIRECTION.IN) {
      this.camMovingDirection = CAM_MOVING_DIRECTION.OUT;
      return;
    }

    if (this.camMovingDirection === CAM_MOVING_DIRECTION.OUT) {
      finished = true;
      return;
    }
  }

  private moveCamOnY(y: number, duration = 1.5) {
    gsap.to(this.camera.position, { y, duration });
  }

  private cameraRotation = () => {
    if (stopRotate) {
      return;
    }
    this.camera.rotation.z += Math.PI / 50000;
  };

  public componentWillUnmount() {
    window.removeEventListener("resize", this.resizeHandler);
  }

  public render() {
    return (
      <div style={wrapperStyle}>
        <div ref={this.setContent} style={innerStyle} />
      </div>
    );
  }
  private init = () => {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, null, 3, 1000);
    this.camera.position.set(0, CAMERA_POSITION_Y.START, 0);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    // this.control = new (OrbitControl(THREE))(
    //   this.camera,
    //   this.renderer.domElement
    // );
    // this.control.zoomSpeed = 0.2;
    this.renderer.render(this.scene, this.camera);
    this.renderer.setSize(this.content.clientWidth, this.content.clientHeight);
    this.content.appendChild(this.renderer.domElement);
    this.resizeHandler();
    window.addEventListener("resize", this.resizeHandler);
    this.animate();
  };

  private addAxis = () => {
    const gridHelper = new THREE.GridHelper(50, 30, 0x444444, 0x333333);
    this.scene.add(gridHelper);
  };

  private animate = () => {
    // this.control.update();
    this.cameraRotation();
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };
  private setContent = (ref) => (this.content = ref);

  private renderArrows = () => {
    getVectors(3000).forEach((vector) => {
      this.addArrow(vector, Math.random() / 4 + 2, getColor());
    });

    const sum = new THREE.Vector3(1, 1.5, 1);
    sum.normalize();
    // this.addArrow(sum, 15, new THREE.Color("cyan"), 1);
  };

  private addArrow = (dir, length = 10, color = 0xffff00, headSize = 0.2) => {
    const arrow = new THREE.ArrowHelper(
      dir,
      dir.multiplyScalar((Math.random() + 0.1) * 1.5),
      length,
      color,
      headSize
    );
    this.scene.add(arrow);
  };
}

export default Universe;
