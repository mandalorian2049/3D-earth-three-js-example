import React from 'react';
import * as THREE from 'three';
import debounce from 'lodash/debounce';
import OrbitControl from 'three-orbit-controls';

const wrapperStyle : React.CSSProperties = {
    flex: 1,
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
};
const innerStyle : React.CSSProperties = {
    flex: 1,
    border: '1px solid #CCC',
    overflow: 'hidden',
};

class Universe extends React.Component {

    private content;
    private scene;
    private camera;
    private renderer;
    private control;
    private globe;
    private light;

    private resizeHandler = debounce(() => {
        this.camera.aspect = this.content.clientWidth / this.content.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.content.clientWidth, this.content.clientHeight);
    }, 100);

    public componentDidMount() {
        this.init();
        this.renderGlobe();
        this.renderLight();
    }
    public componentWillUnmount() {
        window.removeEventListener('resize', this.resizeHandler);
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
        this.camera.position.set(50, 40, 120);
        this.camera.lookAt(new THREE.Vector3(0 , 0, 0));
        this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        this.control = new (OrbitControl(THREE))(this.camera, this.renderer.domElement);
        this.control.zoomSpeed = 0.2;
        this.camera.position.z = 1;
        this.renderer.render(this.scene, this.camera);
        this.renderer.setSize(this.content.clientWidth, this.content.clientHeight);
        this.content.appendChild(this.renderer.domElement);
        this.resizeHandler();
        window.addEventListener('resize', this.resizeHandler);
        this.animate();
    }
    private renderLight = () => {
        this.light = new THREE.DirectionalLight(new THREE.Color(0xC9919B));
        this.light.position.set(0, 5, 5);
        this.light.castShadow = true;
        const ambient = new THREE.AmbientLight(0x523B3F); // soft white light
        this.scene.add(ambient);
        this.scene.add(this.light);
    }
    private renderGlobe = () => {
        const globe = new THREE.SphereGeometry(8, 32, 32);
        const wireFrameGeometry = new THREE.SphereGeometry(8.2, 8, 8);
        const wireframe = new THREE.WireframeGeometry(wireFrameGeometry);
        const wireLines = new THREE.LineSegments(wireframe);
        // console.log(wireLines);
        wireLines.material.depthTest = false;
        wireLines.material.opacity = 0.3;
        wireLines.material.transparent = true;
        wireLines.material.color = new THREE.Color(0xc9919b);
        const material = new THREE.MeshLambertMaterial({ color: 0x888888, opacity: 0.5 });
        this.globe = new THREE.Mesh(globe, material);
        this.scene.add(this.globe, wireLines);
    }
    private animate = () => {
        this.control.update();
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }
    private setContent = ref => this.content = ref;
}

export default Universe;
