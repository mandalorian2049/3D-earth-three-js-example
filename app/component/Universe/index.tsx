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
    border: '1px solid red',
    overflow: 'hidden',
};

class Universe extends React.Component {

    private content;
    private scene;
    private camera;
    private renderer;
    private control;

    private resizeHandler = debounce((e) => {
        this.camera.aspect = this.content.clientWidth / this.content.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.content.clientWidth, this.content.clientHeight);
    }, 100);

    public componentDidMount() {
        const ratio = this.content.clientWidth / this.content.clientHeight;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(30, ratio, 0.1, 1000);
        this.camera.position.set(50, 40, 120);
        this.camera.lookAt(new THREE.Vector3(0 , 0, 0));
        this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        this.control = new (OrbitControl(THREE))(this.camera, this.renderer.domElement);
        const light = new THREE.DirectionalLight(new THREE.Color('rgb(255, 255, 255)'));
        light.position.set(0, 5, 5);
        light.castShadow = true;
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);
        this.camera.position.z = 5;
        this.renderer.render(this.scene, this.camera);
        this.renderer.setSize(this.content.clientWidth, this.content.clientHeight);
        this.content.appendChild(this.renderer.domElement);
        window.addEventListener('resize', this.resizeHandler);
        this.animate();
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

    private animate = () => {
        this.control.update();
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }
    private setContent = ref => this.content = ref;
}

export default Universe;
