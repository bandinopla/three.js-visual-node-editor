 
import { Theme } from "../../colors/Theme";
import { DraggableValue } from "../../components/DraggableValue";
import { MaterialProperty } from "../../properties/MaterialProperty";
import { WinNode } from "../WinNode";
import { ThreeScene } from "../../ThreeScene";

export class ScenePreviewNode extends WinNode {
    constructor( protected scene:ThreeScene ) { 
 
        const ambientLightSlider = new DraggableValue("Ambient light", true, 0, 3, 0.1, (_, intensity)=>this.onAmbientLightSlider(intensity) );

        super("Scene Preview", Theme.config.groupOutput, [
            ambientLightSlider,
            new DraggableValue("Rotation speed", true, 0, 2, 0.1),
            new MaterialProperty(0),
            new MaterialProperty(1),
            new MaterialProperty(2),
        ]); 

        this.canBeDeleted = false; 

        ambientLightSlider.value = this.scene.ambientLight.intensity;
    }

    protected onAmbientLightSlider( intensity:number ) {
        console.log( intensity)
        this.scene.ambientLight.intensity = intensity;
    }

    protected override somethingChanged(): void {
        alert("Got it! recompile!!")
    }
}