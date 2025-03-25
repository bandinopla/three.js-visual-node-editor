import { Theme } from "../colors/Theme"; 
import { Input } from "./Input";

export class UVProperty extends Input
{
    constructor() {
        super( Theme.config.vec2 )  
    }

    override renderContents(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {
        this.writeText(ctx,"UV", this.fontSize, 10, maxHeight, this.fontColor);
    }
}