 
import { Theme } from "../../colors/Theme";
import { HeaderElement } from "../../components/Header";
import { Layout } from "../../layout/Layout";
import { Node } from "../Node";
import { Vector3Output } from '../../properties/Vector3Output';
import { TextureProperty } from '../../properties/TextureProperty';
import { Vector1Output } from '../../properties/Vector1Output';
import { UVChannelProperty } from "../../properties/UVChannelProperty";

export class ImageTextureNode extends Node {
    constructor() {
        super(new Layout("column","start", "start", [
 
            new HeaderElement("Image Texture", Theme.config.groupTexture),

            new Layout("column", "start", "start", [
                new Vector3Output("Color"),
                new Vector1Output("Alpha"),
                new TextureProperty(),  
                new UVChannelProperty()
            ], 5)
            
        ])); 
    }
}