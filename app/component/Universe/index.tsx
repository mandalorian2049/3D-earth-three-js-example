import React from 'react';
import { mesh as topoMesh } from 'topojson';
import * as THREE from 'three';
import debounce from 'lodash/debounce';
import OrbitControl from 'three-orbit-controls';

const GLOBE_SIZE = 8;

const wrapperStyle : React.CSSProperties = {
    flex: 1,
    padding: '5px',
    display: 'flex',
    flexDirection: 'column',
};
const innerStyle : React.CSSProperties = {
    flex: 1,
    border: '1px solid #CCC',
    overflow: 'hidden',
};

const vertex = ([longitude, latitude], radius) => {
    const lambda = longitude * Math.PI / 180;
    const phi = latitude * Math.PI / 180;
    return new THREE.Vector3(
        radius * Math.cos(phi) * Math.cos(lambda),
        radius * Math.sin(phi),
        -radius * Math.cos(phi) * Math.sin(lambda)
    );
};

const wireframe = (multilinestring, radius, material) => {
    const geometry = new THREE.Geometry();
    for (const P of multilinestring.coordinates) {
        for (let p0, p1 = vertex(P[0], radius), i = 1; i < P.length; ++i) {
            geometry.vertices.push(p0 = p1, p1 = vertex(P[i], radius));
        // geometry.faces.push( new THREE.Face3( 0, -1, -2 ) );
        }
    }
    return new THREE.LineSegments(geometry, material);
};

class Universe extends React.Component {

    private content;
    private scene;
    private camera;
    private renderer;
    private control;
    private globe;

    private resizeHandler = debounce(() => {
        this.camera.aspect = this.content.clientWidth / this.content.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.content.clientWidth, this.content.clientHeight);
    }, 100);

    public componentDidMount() {
        this.init();
        this.renderGlobe();
        this.renderLight();
        this.loadLand();
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
        this.camera.position.set(0, 40, 0);
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
        const light = new THREE.SpotLight(new THREE.Color(0xffffff), 0.5);
        light.penumbra = 1;
        light.angle = 0.4;
        // light.position.set(5, 0, 0);
        light.castShadow = true;
        this.camera.add(light);
        this.scene.add(this.camera);
        // const ambient = new THREE.AmbientLight(0x444444); // soft white light
        // this.scene.add(ambient);
        // this.scene.add(this.light);
    }
    private renderGlobe = () => {
        const globe = new THREE.SphereGeometry(GLOBE_SIZE, 32, 32);
        const wireFrameGeometry = new THREE.SphereGeometry(GLOBE_SIZE, 8, 8);
        const wireLines = new THREE.LineSegments(
            new THREE.WireframeGeometry(wireFrameGeometry),
            new THREE.LineBasicMaterial({
                color: 0xcccccc,
                opacity: 0.1,
                depthTest: false,
                transparent: true,
            })
        );
        const material = new THREE.MeshLambertMaterial({
            color: 0x888888,
            opacity: 0.5,
        });
        this.globe = new THREE.Mesh(globe, material);
        this.scene.add(this.globe, wireLines);
    }
    private animate = () => {
        this.control.update();
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }
    private setContent = ref => this.content = ref;
    private loadLand = async () => {
        const topology = await (await fetch('https://unpkg.com/world-atlas@1.1.4/world/50m.json')).json();
        // console.log(topology);
        const mesh = topoMesh(topology, topology.objects.land);
        const t = wireframe(mesh, GLOBE_SIZE, new THREE.LineBasicMaterial({
            color: 0x00ff00,
        }));
        this.scene.add(t);
    }
}

export default Universe;
