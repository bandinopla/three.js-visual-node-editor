import { Theme } from "../../colors/Theme";
import { BaseColorProperty } from "../../properties/BaseColorProperty";
import { MaterialOutput } from "../../properties/MaterialOutput";
import { WinNode } from "../WinNode";

export class MeshStandardNode extends WinNode {
    constructor() {
        super( "MeshStandardMaterial", Theme.config.groupShader, [
            new MaterialOutput(),
            new BaseColorProperty()
        ] );
    }
}