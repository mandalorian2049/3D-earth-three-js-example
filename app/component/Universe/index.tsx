import React from 'react';
import {
    mesh as topoMesh,
    feature as topoFeature,
} from 'topojson';
import * as THREE from 'three';
import debounce from 'lodash/debounce';
import OrbitControl from 'three-orbit-controls';

import cloudMap from '@/assets/fair_clouds.png';
import { mapTexture } from './utils/mapTexture';

const GLOBE_SIZE = 8;

interface SatelliteInterface {
    id : string;
    rotation : number;
    radius : number;
    startingPoint : number;
    speed : number;
}

const SATELLITE : Array<SatelliteInterface> = [
    { id: 'a', rotation: Math.PI * (1/3), radius: GLOBE_SIZE + 2, startingPoint: 0, speed: -1 },
    { id: 'b', rotation: Math.PI * (2/3), radius: GLOBE_SIZE + 4, startingPoint: Math.PI * (2 / 3), speed: 0.5 },
    { id: 'c', rotation: Math.PI, radius: GLOBE_SIZE + 3, startingPoint: Math.PI * (4 / 3), speed: -1.2 },
];

const wrapperStyle : React.CSSProperties = {
    flex: 1,
    padding: '3px',
    display: 'flex',
    flexDirection: 'column',
};
const innerStyle : React.CSSProperties = {
    flex: 1,
    border: '1px solid #444',
    overflow: 'hidden',
};

class Universe extends React.Component {

    private content;
    private scene;
    private camera;
    private renderer;
    private control;
    private globe;
    private cloudLayer;
    private satelliteControl = {};

    private resizeHandler = debounce(() => {
        this.camera.aspect = this.content.clientWidth / this.content.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.content.clientWidth, this.content.clientHeight);
    }, 100);

    public componentDidMount() {
        this.init();
        this.renderGlobe();
        this.renderLight();
        this.loadCloud();
        this.loadLand();
        SATELLITE.forEach(it => this.addSatellite(it));
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
        this.camera.position.set(40, 5, 20);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        this.control = new (OrbitControl(THREE))(this.camera, this.renderer.domElement);
        this.control.zoomSpeed = 0.2;
        this.renderer.render(this.scene, this.camera);
        this.renderer.setSize(this.content.clientWidth, this.content.clientHeight);
        this.content.appendChild(this.renderer.domElement);
        this.resizeHandler();
        window.addEventListener('resize', this.resizeHandler);
        this.animate();
    }
    private renderLight = () => {
        const light = new THREE.SpotLight(new THREE.Color(0xffffff), 0.4);
        light.penumbra = 1;
        light.angle = 0.4;
        light.castShadow = true;
        this.camera.add(light);
        this.scene.add(this.camera);
        // const sun = new THREE.PointLight(new THREE.Color(0xffffff), 0.5);
        // sun.position.set(40, 0, -40);
        // this.scene.add(sun);
    }
    private renderGlobe = () => {
        const cloud = new THREE.SphereGeometry(GLOBE_SIZE + 0.2, 32, 32);
        const material = new THREE.MeshLambertMaterial({
            color: 0x003366,
            // opacity: 0.9,
        });
        const tM = new THREE.MeshLambertMaterial({
            opacity: 0.0,
            transparent: true,
        });

        this.cloudLayer = new THREE.Mesh(cloud, tM);
        const shieldLayer = new THREE.Mesh(
            new THREE.SphereGeometry(GLOBE_SIZE + 0.25, 32, 32),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                opacity: 0.2,
                transparent: true,
                metalness: 1,
                roughness: 0.6,
            }),
        );
        this.globe = new THREE.Mesh(
            new THREE.SphereGeometry(GLOBE_SIZE, 32, 32),
            material,
        );
        this.scene.add(this.globe, this.cloudLayer, shieldLayer);
    }
    private animate = () => {
        this.control.update();
        requestAnimationFrame(this.animate);
        if (this.globe) {
            this.globe.rotation.y += 0.0007;
            // this.globe.rotation.x += 0.001;
        }
        if (this.cloudLayer) {
            this.cloudLayer.rotation.y += 0.001;
        }
        SATELLITE.forEach((it) => {
            const satellite = this.satelliteControl[it.id];
            if (satellite && satellite.pivot) {
                satellite.pivot.rotation.z += (0.01 * it.speed);
            }

        });
        this.renderer.render(this.scene, this.camera);
    }
    private setContent = ref => this.content = ref;
    private loadLand = async () => {
        // Try some d3 shit
        const world = await (await fetch('https://raw.githubusercontent.com/sghall/webgl-globes/master/data/world.json')).json();
        const countries = topoFeature(world, world.objects.countries);
        const texturCanvas = mapTexture(countries);
        const map = new THREE.Texture(texturCanvas.node());
        const bumpLoader = new THREE.TextureLoader();
        const bumpMap = bumpLoader.load('https://raw.githubusercontent.com/turban/webgl-earth/master/images/elev_bump_4k.jpg');
        map.needsUpdate = true;
        texturCanvas.remove();

        const mapMaterial  = new THREE.MeshPhongMaterial({
            map,
            bumpMap,
            bumpScale: 0.2,
        });
        this.globe.material = mapMaterial;

    }
    private loadCloud = async () => {
        const loader = new THREE.TextureLoader();
        const high = 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/fair_clouds_4k.png';
        const low = cloudMap;
        const mapOverlay = loader.load(low);
        this.cloudLayer.material = new THREE.MeshPhongMaterial({
            map: mapOverlay,
            color: 0xdddddd,
            transparent: true,
            opacity: 1,
            // depthTest: false,
        });
    }
    private addSatellite = (satellite : SatelliteInterface) => {
        // const circleGeom = new THREE.CircleGeometry(satellite.radius, 128);
        // circleGeom.vertices.shift();
        // circleGeom.vertices.push(circleGeom.vertices[0].clone());
        // const circle = new THREE.LineSegments(
        //     circleGeom,
        //     new THREE.LineDashedMaterial({
        //         color: 'cyan',
        //         opacity: 0.3,
        //         transparent: true,
        //         linewidth: 5,
        //         scale: 1,
        //         dashSize: 10,
        //         gapSize: 0,
        //     }),
        // );
        // circle.rotation.x = satellite.rotation + (Math.PI / 2);
        // // this.scene.add(circle);

        const pivot = new THREE.Object3D();
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 'cyan',
            wireframe: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = satellite.radius;

        const communicateRadius = new THREE.CircleGeometry(3, 32);
        communicateRadius.vertices.shift();
        communicateRadius.vertices.push(communicateRadius.vertices[0].clone());
        const communicateArea = new THREE.Line(
            communicateRadius,
            new THREE.LineDashedMaterial({
                color: 'violet',
                opacity: 0.6,
                transparent: true,
                // depthTest: false,
            }),
        );
        communicateArea.rotation.x = Math.PI / 2;
        communicateArea.position.y = GLOBE_SIZE - 0.3;
        pivot.add(communicateArea);
        const light = new THREE.SpotLight(new THREE.Color(0x00ffff), 1);
        light.penumbra = 0.1;
        light.angle = 1;
        light.castShadow = true;
        mesh.add(light);
        pivot.add(mesh);
        pivot.rotation.x = satellite.rotation + (Math.PI / 2);
        pivot.rotation.z = satellite.startingPoint;
        this.satelliteControl[satellite.id] = { pivot };
        this.scene.add(pivot);
    }
}

export default Universe;
