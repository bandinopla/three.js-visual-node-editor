import { clamp } from 'three/src/math/MathUtils.js';
import * as THREE from 'three/webgpu';
import { WebGPURenderer } from 'three/webgpu';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

type SceneEvents = {
    modelLoaded: {}
}

export class ThreeScene extends THREE.EventDispatcher<SceneEvents>{
    readonly scene:THREE.Scene;
    readonly camera:THREE.PerspectiveCamera;
    readonly renderer:WebGPURenderer;
    readonly objHolder:THREE.Object3D;
    private clock:THREE.Clock;
    readonly ambientLight:THREE.AmbientLight;
    readonly directionalLight:THREE.DirectionalLight;
    private objs:THREE.Mesh[]=[]
    readonly pointLight:THREE.PointLight;
    private mouse:THREE.Vector2 = new THREE.Vector2();
    rotationSpeed = 1;
    protected _currentObjectIndex = 0; 

    private materialNotSet = new THREE.MeshStandardMaterial({ color: 0xcccccc });

    constructor() {
        super();

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        this.renderer = new WebGPURenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight ); 
        this.renderer.setClearColor(0x1d1d1d)

        this.objHolder = new THREE.Object3D();
        this.clock = new THREE.Clock();

        this.ambientLight = new THREE.AmbientLight(0xffffff,0.1);
        this.pointLight = new THREE.PointLight(0xffffff,5,15);
        this.directionalLight = new THREE.DirectionalLight()
        

        window.addEventListener('mousemove', (event) => {
            // Normalize mouse coordinates to [-1, 1]
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener("resize", ev=>{
            // Update camera aspect ratio
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();

            // Update renderer size
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        })

        this.buildScene()
    }

    protected buildScene() { 
        const material = this.materialNotSet;

        //
        // dummy objects
        //
        const cube = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), material ); 
              cube.name="Cube"; 
              this.objs.push( cube );
              this.objHolder.add(cube);

        const sphere = new THREE.Mesh( new THREE.SphereGeometry(1), material ); 
              sphere.name="Sphere"; 
              sphere.visible = false;
              this.objs.push( sphere );
              this.objHolder.add( sphere );

        const loader = new GLTFLoader();

        loader.load( import.meta.env.BASE_URL+'monkey.glb', ( gltf ) => {
        
            const monkey = gltf.scene.getObjectByName("monkey") as THREE.Mesh;
            monkey.name = "Monkey";
            monkey.visible = false;

            this.objs.push( monkey)
            this.objHolder.add( monkey );

            this.dispatchEvent({ type:"modelLoaded" })
        
        }, undefined, function ( error ) {
        
            console.error( error );
        
        } );


        this.scene.add( this.objHolder )

        this.camera.position.z = 4;
        this.camera.position.x = -3;

        this.scene.add( this.ambientLight );
        this.scene.add( this.directionalLight );



        this.scene.add( this.pointLight );

        this.pointLight.intensity = 15
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
        const fixedZ = 2
    
        // Calculate the distance from the camera to the plane at fixedZ
        const distance = (fixedZ - this.camera.position.z) / dir.z;
    
        // Calculate the world position at the fixed Z plane
        const pos = this.camera.position.clone().add(dir.multiplyScalar(distance));
    
        // Update the light's position
        this.pointLight.position.set(pos.x, pos.y, fixedZ);
      
    }

    get meshes() { return this.objs }

    get currentObjectIndex() {
        return this._currentObjectIndex;
    }

    set currentObjectIndex(index:number) {
        this._currentObjectIndex = clamp( index, 0, this.objs.length-1 );
        this.objs.forEach( (obj,i)=>obj.visible = i==index )
        console.log(index, this.objs )
    }

    render() {

        const delta = this.clock.getDelta()
        this.updateLightPosition();
        this.objHolder.rotateY(delta*this.rotationSpeed)
        //this.objHolder.rotateX(-delta*this.rotationSpeed)
        this.renderer.render( this.scene, this.camera );
    }

    setMaterial(index: number, material?: THREE.Material) {

        material ??= this.materialNotSet;

        this.objs.forEach((obj: THREE.Mesh) => {
          if (Array.isArray(obj.material)) {
            // Object has multiple materials
            if (index < obj.material.length) {
              obj.material[index] = material;
            } else {
              // Create missing material slots
              while (obj.material.length <= index) {
                obj.material.push(this.materialNotSet);
              }
              obj.material[index] = material;
            }
          } else {
            // Object has a single material
            if (index === 0) {
              obj.material = material;
            } else {
              // Change to an array of materials
              obj.material = [obj.material];
              while (obj.material.length <= index) {
                obj.material.push(this.materialNotSet);
              }
              obj.material[index] = material;
            }
          }
        });
      }
}