import React from "react";
import * as THREE from "three";
import debounce from "lodash/debounce";
import OrbitControl from "three-orbit-controls";

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
    this.camera = new THREE.PerspectiveCamera(30, null, 0.1, 1000);
    this.camera.position.set(40, 5, 20);
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
    const gridHelper = new THREE.GridHelper(100, 50, 0x333333, 0x222222);
    this.scene.add(gridHelper);
  };

  private animate = () => {
    this.control.update();
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };
  private setContent = (ref) => (this.content = ref);

  private renderArrows = () => {
    this.addArrow(new THREE.Vector3(1, 2, 0), 10, 0xffffff);
    this.addArrow(new THREE.Vector3(1, 2, 1), 10, 0xffff00);
    this.addArrow(new THREE.Vector3(2, 2, 0), 10, 0xff00ff);
    this.addArrow(new THREE.Vector3(1, 2, 2), 10, 0x00ffff);
    this.addArrow(new THREE.Vector3(1, 1, 1), 10, 0xf0f0ff);
    this.addArrow(new THREE.Vector3(2, 2, 2), 10, 0xfff0f0);
    this.addArrow(new THREE.Vector3(1, -5, -1), 10, 0xff0f0f);
    this.addArrow(new THREE.Vector3(0, 1, 2), 10, 0xf0f0ff);
    this.addArrow(new THREE.Vector3(1, 2, 3), 10, 0x0f0fff);
    this.addArrow(new THREE.Vector3(3, 2, 0), 10, 0x0ffff0);
  };

  private addArrow = (dir, length = 10, color = 0xffff00) => {
    //normalize the direction vector (convert to vector of length 1)
    dir.normalize();
    const origin = new THREE.Vector3(0, 0, 0);
    const arrowHelper = new THREE.ArrowHelper(dir, origin, length, color, 0.5);
    this.scene.add(arrowHelper);
  };
}

export default Universe;
