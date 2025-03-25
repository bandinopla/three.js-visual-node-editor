import { Vector3Output } from '../../properties/Vector3Output';
import { TextureProperty } from '../../properties/TextureProperty';
import { Vector1Output } from '../../properties/Vector1Output'; 
import { TextureExtensionProperty } from "../../properties/TextureExtensionProperty";
import { TextureMappingModeProperty } from "../../properties/TextureMappingModeProperty";
import { UVTransformProperty } from "../../properties/UVTransformProperty";
import { TextureTypeNode } from "./TextureTypeNode";

export class ImageTextureNode extends TextureTypeNode {
    constructor() {
        super("Image Texture", 
            [
                new Vector3Output("Color"),
                new Vector1Output("Alpha"),
                new TextureProperty(),   
                new TextureExtensionProperty(),
                new TextureMappingModeProperty(),
                new UVTransformProperty()
            ]
        ); 
    }
}