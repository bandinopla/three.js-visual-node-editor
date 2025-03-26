import { Theme } from "../colors/Theme";
import { Output } from "./Output";

export class MaterialOutput extends Output {
    constructor() {
        super( "Material", Theme.config.materialOutputSocketColor )
    }
}