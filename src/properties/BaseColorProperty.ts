import { Theme } from "../colors/Theme";
import { ColorPicker } from "../components/ColorPicker";
import { TextLabel } from "../components/TextLabel";
import { Layout } from "../layout/Layout";
import { Input } from "./Input";

export class BaseColorProperty extends Input {
 

    constructor() {
        super(Theme.config.vec3); 

        this.layout = new Layout([
            new TextLabel("Base Color"), 
            new ColorPicker()
        ],{
            justify:"space-between"
        }); 
        this.xPadding = 10
    }

    // override render(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {
    //     ctx.fillStyle="red"
    //     ctx.fillRect(0,0,maxWidth, maxHeight)
    // }
}