 
import { Theme } from "../../colors/Theme";
import { DraggableValue } from "../../components/DraggableValue";
import { MaterialProperty } from "../../properties/MaterialProperty";
import { WinNode } from "../WinNode";
import { ThreeScene } from "../../ThreeScene";

export class ScenePreviewNode extends WinNode {
    constructor( protected scene:ThreeScene ) {
 
        super("Scene Preview", Theme.config.groupOutput, [
            new DraggableValue("Ambient light", true, 0, 10, 0.1),
            new DraggableValue("Rotation speed", true, 0, 2, 0.1),
            new MaterialProperty(".material [ 0 ] ")
        ]);

        this.canBeDeleted = false;
    }
}