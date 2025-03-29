 
import { Theme } from "../../colors/Theme";
import { DraggableValue } from "../../components/DraggableValue";
import { MaterialProperty } from "../../properties/MaterialProperty";
import { WinNode } from "../WinNode";
import { ThreeScene } from "../../ThreeScene";
import { Script } from "../../export/Script";
import { ComboBox } from "../../components/ComboBox";

export class ScenePreviewNode extends WinNode {

    protected materialSlots:MaterialProperty[];

    constructor( protected scene:ThreeScene ) { 
 
        const ambientLightSlider = new DraggableValue("Ambient light", true, 0, 3, 0.1, value =>this.onAmbientLightSlider(value) );
        const rotationSpeedSlider = new DraggableValue("Rotation speed", true, 0, 2, 0.1, value =>scene.rotationSpeed=value);
        const objType = new ComboBox("Wrapping mode", scene.meshes.map(m=>m.name), value=>scene.currentObjectIndex=value  );
              objType.xPadding = 10;

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

        ambientLightSlider.value = this.scene.ambientLight.intensity;
        rotationSpeedSlider.value = this.scene.rotationSpeed;
        objType.index = this.scene.currentObjectIndex;

        console.log("SPEED", this.scene.rotationSpeed)
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

        const material = script.eval( materialRef+"()" );

        this.scene.setMaterial( materialIndex, material );
    }
}