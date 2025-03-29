 
import { Theme } from "../../colors/Theme";
import { DraggableValue } from "../../components/DraggableValue";
import { MaterialProperty } from "../../properties/MaterialProperty";
import { WinNode } from "../WinNode";
import { ThreeScene } from "../../ThreeScene";
import { Script } from "../../export/Script";
import { ComboBox } from "../../components/ComboBox";

export class ScenePreviewNode extends WinNode {

    protected materialSlots:MaterialProperty[]; 

    protected ambientLightSlider:DraggableValue;
    protected rotationSpeedSlider:DraggableValue;
    protected objTypeCombo:ComboBox;

    constructor( protected scene:ThreeScene ) { 
 
        const ambientLightSlider = new DraggableValue("Ambient light", true, 0, 3, 0.1, value =>this.onAmbientLightSlider(value) );
        const rotationSpeedSlider = new DraggableValue("Rotation speed", true, 0, 2, 0.1, value =>scene.rotationSpeed=value);
        const objType = new ComboBox("Wrapping mode", scene.meshes.map(m=>m.name), value=>scene.currentObjectIndex=value  );

        const materialSlots = [
            new MaterialProperty(0),
            new MaterialProperty(1),
            new MaterialProperty(2),
        ]

        super("Scene Preview", Theme.config.groupOutput, [
            ambientLightSlider,
            rotationSpeedSlider,
            objType,
             
            ...materialSlots
        ]); 

        this.canBeDeleted = false; 
        this.materialSlots = materialSlots;

        this.ambientLightSlider = ambientLightSlider;
        this.rotationSpeedSlider = rotationSpeedSlider;
        this.objTypeCombo = objType;

        ambientLightSlider.value = this.scene.ambientLight.intensity;
        rotationSpeedSlider.value = this.scene.rotationSpeed;
        objType.index = this.scene.currentObjectIndex;  

    }

    protected onAmbientLightSlider( intensity:number ) {
        console.log( intensity)
        this.scene.ambientLight.intensity = intensity;
    } 

    override update(): void {
        
        this.compileMaterialAndAdd( 0 )

    }

    protected compileMaterialAndAdd( materialIndex:number )
    {
        const slot = this.materialSlots[ materialIndex ];

        if( !slot.connectedTo )
        {
            this.scene.setMaterial( materialIndex, undefined );
            return;
        }

        const script = new Script();

        const materialRef = slot.writeScript( script );

        console.log( script.toString("", false ))

        const material = script.eval( materialRef+"()" );

        this.scene.setMaterial( materialIndex, material );
    }

    override serialize(): Record<string, any> {
        return {
            ...super.serialize(), 
            ambientLight: this.ambientLightSlider.value,
            rotationSpeed: this.rotationSpeedSlider.value,
            objType: this.objTypeCombo.index
        }
    }

    override unserialize(data: Record<string, any>): void {
        super.unserialize(data);

        this.ambientLightSlider.value = data.ambientLight ?? 1;
        this.rotationSpeedSlider.value = data.rotationSpeed ?? 1;
        this.objTypeCombo.index = data.objType ?? 0;
    }
}

