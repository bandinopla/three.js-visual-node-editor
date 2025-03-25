import { LayoutElement } from "../layout/LayoutElement";

export class ImagePreview extends LayoutElement { 

    private _img:HTMLImageElement;
    private isLoaded = false;

    constructor() {
        super();

        this.backgroundColor = "black";
        this.boxShadowLevel = 4;

        this._img = document.createElement('img');
        this._img.onload = ev=> {
            this.isLoaded = true;
        }
    }

    override width(ctx: CanvasRenderingContext2D): number {
        return 100;
    }

    override height(ctx: CanvasRenderingContext2D): number {
        return 100
    }

    override renderContents(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {
  
        if( this.isLoaded )
            ctx.drawImage( this._img, 0,0,maxWidth, maxHeight );
 
    }

    reset() {
        this.isLoaded = false;
        this._img.src = ""
    }

    show( url:string )
    { 
        this.isLoaded = false;
        this._img.src = url ;  
    }
}