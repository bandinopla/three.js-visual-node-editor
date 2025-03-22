import { texture, uv } from 'three/tsl';

import { WinNode } from "./WinNode";
import { WinProperty } from "./WinProperty";
import { WinSlideProperty } from "./WinSlideProperty";
import { WinOutputProperty } from './WinOutputProperty';

export class DummyWin extends WinNode {
    constructor() {
        super("Image Sample"); 

        this.childs = [
            new WinOutputProperty("vec4"),
            new WinProperty("Texture"),
            new WinSlideProperty("UV", 0,100)
        ]
    }
}