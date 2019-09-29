import React from 'react';
import { geoInterpolate } from 'd3-geo';
import {
    mesh as topoMesh,
    feature as topoFeature,
} from 'topojson';
import * as THREE from 'three';
import debounce from 'lodash/debounce';
import OrbitControl from 'three-orbit-controls';

import cloudMap from '@/assets/fair_clouds.png';
import { mapTexture } from './utils/mapTexture';
import { positionOnSphereFromLatLon } from './utils/position';

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const clamp = (num, min, max) => (num <= min ? min : (num >= max ? max : num));

const CURVE_MIN_ALTITUDE = 5;
const CURVE_MAX_ALTITUDE = 10;
const CURVE_SEGMENTS = 32;

const getSpline = (prevCoord, currentCoord, size) => {
    const startLat = prevCoord.lat;
    const startLng = prevCoord.lon;
    const endLat = currentCoord.lat;
    const endLng = currentCoord.lon;
    const start = positionOnSphereFromLatLon(startLat, startLng, size);
    const end = positionOnSphereFromLatLon(endLat, endLng, size);
    const startVec = new THREE.Vector3(start.x, start.y, start.z);
    const endVec = new THREE.Vector3(end.x, end.y, end.z);
    const altitude = clamp(startVec.distanceTo(endVec) * 0.5, CURVE_MIN_ALTITUDE, CURVE_MAX_ALTITUDE);
    const interpolate = geoInterpolate([startLng, startLat], [endLng, endLat]);
    const midCoord1 = interpolate(0.4);
    const midCoord2 = interpolate(0.7);
    const mid1 = positionOnSphereFromLatLon(midCoord1[1], midCoord1[0], size + altitude);
    const mid2 = positionOnSphereFromLatLon(midCoord2[1], midCoord2[0], size + altitude);
    return {
      start,
      end,
      spline: new THREE.CubicBezierCurve3(start, mid1, mid2, end),
    };
  };

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

const CITIES = {
    Lhasa: { lat: 29.652491, lon: 91.172112 },
    Vladivostok: { lat: 43.10562, lon: 131.87353 },
    'Port Prince': { lat: 18.5445, lon: -72.363 },
    'Taipei': { lat: 25.105497, lon: 121.597366 },
    'Chicago': { lat: 41.881832, lon: -87.623177 },
    'Osaka': { lat: 34.652500, lon: 135.506302 },
    'Abu Dhabi': { lat: 24.466667, lon: 54.366669 },
    'Dakar': { lat: 14.6937, lon: -17.44406 },
    Berlin: { lat: 52.520008, lon: 13.404954 },
    'Damascus': { lat: 33.510414, lon: 36.278336 },
    Hawaii: { lat: 21.289373, lon: -157.917480 },
    Sydney: { lat: -33.865143, lon: 151.209900 },
    Bangalore: { lat: 12.972442, lon: 77.580643 },
    Nairobi: { lat: -1.291514, lon: 36.874260 },
    'Mexico City': { lat: 19.432608, lon: -99.133209 },
    'Istanbul': { lat: 41.015137, lon: 28.979530 },
    'Salar de Uyuni': { lat: -20.266562, lon: -67.620552 },
    'Almaty': { lat: 43.238949, lon: 76.889709 },
    'Singapore': { lat: 1.290270, lon: 103.851959 },
    Lima: { lat: -12.046374, lon: -77.042793 },
    Cairo: { lat: 31.2357116, lon: 30.0444196 },
    Catalonia: { lat: 41.617592, lon: 0.620015 },
    Alaska: { lat: 66.160507, lon: -153.369141 },
    'Puerto Rico': { lat: 18.200178, lon: -66.664513 },
    LA: { lat: 34.052235, lon: -118.243683 },
};

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
        // this.loadCloud();
        this.loadLand();
        this.loadCities();
        // SATELLITE.forEach(it => this.addSatellite(it));
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
        const light = new THREE.AmbientLight(0xffffff);
        this.scene.add(light);
    }
    private renderGlobe = () => {
        // const cloud = new THREE.SphereGeometry(GLOBE_SIZE + 0.2, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            // opacity: 0.9,
        });
        this.globe = new THREE.Mesh(
            new THREE.SphereGeometry(GLOBE_SIZE, 32, 32),
            material,
        );
        this.scene.add(this.globe);
    }
    private animate = () => {
        this.control.update();
        requestAnimationFrame(this.animate);
        if (this.globe) {
            this.globe.rotation.y += 0.0007;
        }
        this.renderer.render(this.scene, this.camera);
    }
    private setContent = ref => this.content = ref;
    private loadLand = async () => {
        // Try some d3 shit
        const world = await (await fetch('https://raw.githubusercontent.com/sghall/webgl-globes/master/data/world.json')).json();
        const countries = topoFeature(world, world.objects.countries);
        const texturCanvas = mapTexture(countries);
        const map = new THREE.Texture(texturCanvas.node());
        map.needsUpdate = true;
        texturCanvas.remove();

        const mapMaterial  = new THREE.MeshPhongMaterial({
            map,
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
    private loadCities = () => {
        Object.keys(CITIES).forEach((name) => {
            const { lat, lon } = CITIES[name];
            const { x, y, z } = positionOnSphereFromLatLon(lat, lon, GLOBE_SIZE);
            const material = new THREE.MeshBasicMaterial({ color: '#008888' });
            const obj = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), material);
            obj.position.set(x, y, z);
            this.globe.add(obj);
        });
        const addLines = () => {
            setInterval(() => {
                const cities = Object.keys(CITIES);
                const firstPlace = getRandomInt(0, cities.length - 1);
                const secondPlace = getRandomInt(0, cities.length - 1);
                const geo = new THREE.BufferGeometry();
                const { spline } : any = getSpline(CITIES[cities[firstPlace]], CITIES[cities[secondPlace]], GLOBE_SIZE);
                const points = new Float32Array(CURVE_SEGMENTS * 3);
                const vertices = spline.getPoints(CURVE_SEGMENTS - 1);
                for (let i = 0, j = 0; i < vertices.length; i++) {
                    const vertex = vertices[i];
                    points[j++] = vertex.x;
                    points[j++] = vertex.y;
                    points[j++] = vertex.z;
                }
                geo.addAttribute('position', new THREE.BufferAttribute(points, 3));
                const chain = new THREE.Line(geo, new THREE.LineBasicMaterial({
                    color: 0x008888, opacity: 1, transparent: true,
                }));
                this.globe.add(chain);
                let drawProgress = 0;
                const animation = () => {
                    if (drawProgress <= CURVE_SEGMENTS) {
                        geo.setDrawRange(0, drawProgress);
                        drawProgress += 2;
                        requestAnimationFrame(animation);
                    } else {
                        setTimeout(() => {
                            this.globe.remove(chain);
                        }, 200);
                    }
                };
                animation();
            }, 300);
        };

        addLines();
    }
}

export default Universe;
