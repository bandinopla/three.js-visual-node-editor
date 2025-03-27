 
import { Theme } from "../../colors/Theme";
import { DraggableValue } from "../../components/DraggableValue";
import { MaterialProperty } from "../../properties/MaterialProperty";
import { WinNode } from "../WinNode";
import { ThreeScene } from "../../ThreeScene";

export class ScenePreviewNode extends WinNode {

    protected materialSlots:MaterialProperty[];

    constructor( protected scene:ThreeScene ) { 
 
        const ambientLightSlider = new DraggableValue("Ambient light", true, 0, 3, 0.1, (_, intensity)=>this.onAmbientLightSlider(intensity) );

        const materialSlots = [
            new MaterialProperty(0),
            new MaterialProperty(1),
            new MaterialProperty(2),
        ]
        super("Scene Preview", Theme.config.groupOutput, [
            ambientLightSlider,
            new DraggableValue("Rotation speed", true, 0, 2, 0.1),
            ...materialSlots
        ]); 

        this.canBeDeleted = false; 
        this.materialSlots = materialSlots;

        ambientLightSlider.value = this.scene.ambientLight.intensity;
    }

    protected onAmbientLightSlider( intensity:number ) {
        console.log( intensity)
        this.scene.ambientLight.intensity = intensity;
    }

    protected override somethingChanged(): void {
        
    }
}