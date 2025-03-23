import * as THREE from 'three';

export class ThreeScene {
    readonly scene:THREE.Scene;
    readonly camera:THREE.PerspectiveCamera;
    readonly renderer:THREE.WebGLRenderer;
    readonly objHolder:THREE.Object3D;
    private clock:THREE.Clock;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight ); 
        this.renderer.setClearColor(0x1d1d1d)

        this.objHolder = new THREE.Object3D();
        this.clock = new THREE.Clock();

        this.buildScene()
    }

    protected buildScene() {
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
        const cube = new THREE.Mesh( geometry, material ); 

        this.objHolder.add(cube);
        this.scene.add( this.objHolder )

        this.camera.position.z = 5;
        this.camera.position.x = -4;
    }

    render() {

        const delta = this.clock.getDelta()
        this.objHolder.rotateY(delta)
        this.objHolder.rotateX(delta)
        this.renderer.render( this.scene, this.camera );
    }
}