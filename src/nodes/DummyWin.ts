import { texture, uv } from 'three/tsl';

import { WinNode } from "./WinNode";
import { WinProperty } from "../properties/WinProperty";
import { WinSlideProperty } from "../properties/WinSlideProperty";
import { WinOutputProperty } from '../properties/WinOutputProperty';

export class DummyWin extends WinNode {
    constructor() {
        super("Image Texture"); 

        this.childs = [
            new WinOutputProperty("Color"),
            new WinOutputProperty("Alpha"),
            new WinProperty("Texture"),
            new WinProperty("UV"),
            new WinSlideProperty("Opacity", 0,100)
        ]
    }
}