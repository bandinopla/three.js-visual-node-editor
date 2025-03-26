import { Theme } from "../colors/Theme";
import { InteractiveLayoutElement } from "../layout/InteractiveLayoutElement"; 

export class Button extends InteractiveLayoutElement
{
    private xpadding = 5;

    constructor( protected _label:string , protected onClick?:VoidFunction )
    {
        super();
    }

    override width(ctx: CanvasRenderingContext2D): number {
      
        return ctx.measureText(this.label).width + this.xpadding*2;
    }

    override render(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {
        
        //background
        this.roundedRect(ctx, 0,0, maxWidth, maxHeight, 2);
        ctx.fillStyle = Theme.config.btnBgColor;
        ctx.fill();  

        //text
        this.writeText(ctx, this.label, this.fontSize, maxWidth/2, maxHeight, Theme.config.btnTextColor, "center");

        //hit area...
        super.render(ctx, maxWidth, maxHeight);
    }

    override onMouseDown(cursorX: number, cursorY: number): void {
        this.onClick?.();
    }

    get label() {
         return this._label;
    }

    set label( newLabel:string ) {
        this._label = newLabel;
    }
}