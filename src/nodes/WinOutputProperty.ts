import { WinProperty } from "./WinProperty";

export class WinOutputProperty extends WinProperty { 

    constructor( name:string )
    {
        super(name);
        this.hasInput = false;
        this.hasOutput = true;
    }
    protected override renderContents(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {
        this.drawRightText( this.name, ctx, maxWidth, maxHeight, 0)
    }
}