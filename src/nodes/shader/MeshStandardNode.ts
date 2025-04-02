import { Color } from "three";
import { Theme } from "../../colors/Theme";
import { Script } from "../../export/Script"; 
import { BaseColorProperty } from "../../properties/BaseColorProperty";
import { MaterialOutput } from "../../properties/MaterialOutput";
import { WinNode } from "../WinNode"; 
import { InputOrValue } from "../../properties/InputOrValue";
import { MeshStandardNodeMaterial, NormalMapNode } from "three/webgpu";
import { BasicInputProperty } from "../../properties/BasicInputProperty";

export class MeshStandardNode extends WinNode {
 
    protected colorProperty:BaseColorProperty;
    protected metallic:InputOrValue;
    protected roughness:InputOrValue;
    protected normal:BasicInputProperty;

    constructor() {

        const colorNodeInput = new BaseColorProperty();
        const metallic = new InputOrValue(1, { label:"Metallic", min:0, max:1, asBar:true }); 

        const roughness = new InputOrValue(1, { label:"Roughness", min:0, max:1, asBar:true }); 

        const normal = new BasicInputProperty(2, "Normal");


        super( "MeshStandardNodeMaterial", Theme.config.groupShader, [
            new MaterialOutput(),
            colorNodeInput,
            metallic,
            roughness,
            normal
        ] );

        this.colorProperty = colorNodeInput;
        this.metallic = metallic;
        this.roughness = roughness;
        this.normal = normal;
    } 

    override writeScript( script: Script) { 

        const colorNode = this.colorProperty.writeScript( script );
        const metallicNode = this.metallic.writeScript( script );
        const roughnessNode = this.roughness.writeScript( script ); 
        const normalNode = this.normal.writeScript( script ); 

        //const material = new MeshStandardNodeMaterial();  

        return script.define( this.nodeName, `()=>{
            const material = new THREE.MeshStandardNodeMaterial();
            material.colorNode = ${colorNode};

            material.metalnessNode = ${metallicNode};
            material.roughnessNode = ${roughnessNode}; 
${ normalNode!=""? `material.normalNode = ${normalNode};`:"" }

            return material;
        }` );
    }

    override serialize(): Record<string, any> {
        return {
            ...super.serialize(),
            baseColor: "#"+this.colorProperty.baseColor.getHexString(),
            metallic: this.metallic.value,
            roughness: this.roughness.value
        }
    }

    override unserialize(data: Record<string, any>): void {
        super.unserialize(data);
        if( data.baseColor ) this.colorProperty.baseColor = new Color( data.baseColor );

        this.metallic.value = data.metallic;
        this.roughness.value = data.roughness;
    }
}