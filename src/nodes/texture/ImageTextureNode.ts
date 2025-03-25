 
import { Theme } from "../../colors/Theme";
import { HeaderElement } from "../../components/Header";
import { Layout } from "../../layout/Layout";
import { Node } from "../Node";
import { Vector3Output } from '../../properties/Vector3Output';
import { TextureProperty } from '../../properties/TextureProperty';
import { Vector1Output } from '../../properties/Vector1Output';
import { UVChannelProperty } from "../../properties/UVChannelProperty";
import { TextureExtensionProperty } from "../../properties/TextureExtensionProperty";
import { TextureMappingModeProperty } from "../../properties/TextureMappingModeProperty";

export class ImageTextureNode extends Node {
    constructor() {
        super(new Layout( [
 
            new HeaderElement("Image Texture", Theme.config.groupTexture),

            new Layout( [
                new Vector3Output("Color"),
                new Vector1Output("Alpha"),
                new TextureProperty(),  
                new UVChannelProperty(),
                new TextureExtensionProperty(),
                new TextureMappingModeProperty()
            ], {
                direction:"column",
                gap: 5
            })
            
        ], {
            direction:"column"
        })); 
    }
}