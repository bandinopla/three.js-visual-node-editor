 
import { texture, uv } from 'three/tsl';
import { Theme } from "../../colors/Theme";
import { HeaderElement } from "../../components/Header";
import { Space } from "../../components/Space";
import { Layout } from "../../layout/Layout";
import { DebugElement } from "../../properties/DebugElement";
import { NodeTitle } from "../../properties/NodeTitle";
import { Node } from "../Node";
import { Vector3Output } from '../../properties/Vector3Output';
import { TextureProperty } from '../../properties/TextureProperty';
import { Vector1Output } from '../../properties/Vector1Output';

export class ImageTextureNode extends Node {
    constructor() {
        super(new Layout("column","start", "start", [
 
            new HeaderElement("Image Texture", Theme.config.groupTexture),
            new Vector3Output("Color"),
            new Vector1Output("Alpha"),
            new TextureProperty(), 

        ])); 
    }
}