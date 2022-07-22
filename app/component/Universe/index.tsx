import React from "react";
import * as THREE from "three";
import debounce from "lodash/debounce";
import OrbitControl from "three-orbit-controls";

const colorOption = [0x666666, 0x888888, 0xaaaaaa];

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
      )
    );
  }
  return vectors;
};

const wrapperStyle: React.CSSProperties = {
  flex: 1,
  padding: "3px",
  display: "flex",
  flexDirection: "column",
};
const innerStyle: React.CSSProperties = {
  flex: 1,
  border: "1px solid #444",
  overflow: "hidden",
};

class Universe extends React.Component {
  private content;
  private scene;
  private camera;
  private renderer;
  private control;

  private origin = new THREE.Vector3(0, 0, 0);

  private resizeHandler = debounce(() => {
    this.camera.aspect = this.content.clientWidth / this.content.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.content.clientWidth, this.content.clientHeight);
  }, 100);

  public componentDidMount() {
    this.init();
    this.addAxis();
    this.renderArrows();
  }
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
    this.camera = new THREE.PerspectiveCamera(50, null, 0.1, 1000);
    this.camera.position.set(40, 5, 0);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.control = new (OrbitControl(THREE))(
      this.camera,
      this.renderer.domElement
    );
    this.control.zoomSpeed = 0.2;
    this.renderer.render(this.scene, this.camera);
    this.renderer.setSize(this.content.clientWidth, this.content.clientHeight);
    this.content.appendChild(this.renderer.domElement);
    this.resizeHandler();
    window.addEventListener("resize", this.resizeHandler);
    this.animate();
  };

  private addAxis = () => {
    const gridHelper = new THREE.GridHelper(100, 30, 0x444444, 0x333333);
    this.scene.add(gridHelper);
  };

  private animate = () => {
    this.control.update();
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };
  private setContent = (ref) => (this.content = ref);

  private renderArrows = () => {
    getVectors(3348).forEach((vector) => {
      this.addArrow(vector, Math.random() + 4, getColor());
    });

    const sum = new THREE.Vector3(1, 1.5, 1);
    sum.normalize();
    this.addArrow(sum, 15, new THREE.Color("cyan"), 1);
  };

  private addArrow = (dir, length = 10, color = 0xffff00, headSize = 0.4) => {
    const arrowHelper = new THREE.ArrowHelper(
      dir,
      this.origin,
      length,
      color,
      headSize
    );
    this.scene.add(arrowHelper);
  };
}

export default Universe;
