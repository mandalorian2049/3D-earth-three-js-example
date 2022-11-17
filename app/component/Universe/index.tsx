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
  START: 8,
  ZOOM_IN: -1,
  ZOOM_OUT: 40,
};

const colorOption = [
  0x000000, 0x000000, 0x111111, 0x111111, 0x113333, 0x335555,
];

const colorOption2 = [0x446666, 0x88dddd, 0x446666, 0x88dddd, 0x88ffff];

let i = 0;
const getColor = (colorOption) => {
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

const getLightVectors = (num: number) => {
  const vectors = [];
  for (i = 0; i < num; i++) {
    vectors.push(
      new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2,
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

    if (this.camMovingDirection === CAM_MOVING_DIRECTION.IN) {
      this.zoomIn();
      this.camMovingDirection = CAM_MOVING_DIRECTION.OUT;
      return;
    }

    if (this.camMovingDirection === CAM_MOVING_DIRECTION.OUT) {
      this.zoomOut();
      finished = true;
      return;
    }
  }

  private zoomIn() {
    this.renderLightArrows();
    gsap.to(this.camera.position, {
      y: CAMERA_POSITION_Y.ZOOM_IN,
      duration: 6,
      ease: "power4.inOut",
    });
  }
  private zoomOut() {
    gsap.to(this.camera.position, {
      y: CAMERA_POSITION_Y.ZOOM_OUT,
      duration: 2,
      ease: "power1.inOut",
    });
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
    this.camera = new THREE.PerspectiveCamera(50, null, 4, 1000);
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
    getVectors(2000).forEach((vector) => {
      this.addArrow(
        vector,
        vector.multiplyScalar((Math.random() + 0.1) * 1.5),
        Math.random() / 4 + 4,
        getColor(colorOption)
      );
    });

    // const sum = new THREE.Vector3(1, 1.5, 1);
    // sum.normalize();
    // this.addArrow(sum, 15, new THREE.Color("cyan"), 1);
  };

  private renderLightArrows = () => {
    const vectors = getLightVectors(500);
    for (let i = 0; i < vectors.length; i++) {
      const vector = vectors[i];
      (async () => {
        await new Promise((res) => setTimeout(res, Math.random() * 5000));
        this.addArrow(
          vector,
          vector.multiplyScalar((Math.random() + 0.1) * 1.5),
          Math.random() / 8 + 4,
          getColor(colorOption2),
          0.1
        );
      })();
    }
  };

  private addArrow = (
    dir,
    start,
    length = 10,
    color = 0xffff00,
    headSize = 0.2
  ) => {
    const arrow = new THREE.ArrowHelper(dir, start, length, color, headSize);
    this.scene.add(arrow);
  };
}

export default Universe;
