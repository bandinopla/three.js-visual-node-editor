import * as THREE from 'three';

export class ThreeScene {
    readonly scene:THREE.Scene;
    readonly camera:THREE.PerspectiveCamera;
    readonly renderer:THREE.WebGLRenderer;
    readonly objHolder:THREE.Object3D;
    private clock:THREE.Clock;
    readonly ambientLight:THREE.AmbientLight;
    private objs:THREE.Mesh[]=[]
    readonly pointLight:THREE.PointLight;
    private mouse:THREE.Vector2 = new THREE.Vector2();
    rotationSpeed = 1;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight ); 
        this.renderer.setClearColor(0x1d1d1d)

        this.objHolder = new THREE.Object3D();
        this.clock = new THREE.Clock();

        this.ambientLight = new THREE.AmbientLight(0xffffff,0.1);
        this.pointLight = new THREE.PointLight(0xffffff,5,15);

        window.addEventListener('mousemove', (event) => {
            // Normalize mouse coordinates to [-1, 1]
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        this.buildScene()
    }

    protected buildScene() {
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshStandardMaterial( { color: 0xcccccc } );
        const cube = new THREE.Mesh( geometry, material ); 

        this.objHolder.add(cube);
        this.scene.add( this.objHolder )

        this.camera.position.z = 4;
        this.camera.position.x = -4;

        this.scene.add( this.ambientLight );
        this.objs.push( cube );

        const dirLight = new THREE.DirectionalLight()
        this.scene.add( dirLight );

        this.scene.add( this.pointLight );

        this.pointLight.intensity = 3
        this.pointLight.position.z = 3
    }

    private updateLightPosition() {
        // Create a Vector3 with normalized mouse coordinates
        const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5); // Z = 0.5 in NDC (midway in the frustum)
    
        // Unproject the vector to world space using the camera
        vector.unproject(this.camera);
    
        // Calculate the direction from the camera to the unprojected point
        const dir = vector.sub(this.camera.position).normalize();
    
        // We want the light to be at a fixed Z in world space (e.g., Z = 2)
        const fixedZ = 2;
    
        // Calculate the distance from the camera to the plane at fixedZ
        const distance = (fixedZ - this.camera.position.z) / dir.z;
    
        // Calculate the world position at the fixed Z plane
        const pos = this.camera.position.clone().add(dir.multiplyScalar(distance));
    
        // Update the light's position
        this.pointLight.position.set(pos.x, pos.y, fixedZ);
    }

    render() {

        const delta = this.clock.getDelta()
        this.updateLightPosition();
        this.objHolder.rotateY(delta*this.rotationSpeed)
        this.objHolder.rotateX(delta*this.rotationSpeed)
        this.renderer.render( this.scene, this.camera );
    }
}