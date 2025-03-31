import { clamp } from "three/src/math/MathUtils.js";
import { Theme } from "../colors/Theme";
import { InteractiveLayoutElement } from "../layout/InteractiveLayoutElement";
import { Node } from "../nodes/Node";
import { IOverlayRenderer } from "../layout/IOverlayRenderer";
import { Column, Layout } from "../layout/Layout";
import { Button } from "./Button";
import { HeaderElement } from "./Header";
import { ListItem } from "./ListItem";

export class ComboBox extends InteractiveLayoutElement implements IOverlayRenderer {
    
    private _index = 0;

    /**
     * Used to remember the last transform to draw the combo...
     */
    private myTransform!:DOMMatrix;
    private _width = 0;
    private isOpen = false;
    private comboList :Layout;
    private listItems:ListItem[];
    private listLayout:Layout;

    constructor( protected title:string, protected options:string[], protected onChange?:(i:number)=>void ) {
        super() 

        this.listItems = options.map( (opt, i)=>new ListItem( opt, false, ()=>this.onOptionClicked(i), this.onScroll.bind(this)  ));
        this.listLayout = new Column(this.listItems, {
            maxHeight: Theme.config.nodeRowHeight*4.5,
            overflowHidden:true
        });

        this.comboList = new Layout([

            new ListItem( title, true ),
            this.listLayout
        ], 
        {
            direction:"column",
            align:"stretch",  
        }); 

        this.comboList.backgroundColor = Theme.config.comboboxOptionsBgColor;
        this.comboList.boxShadowLevel = 8;
        this.comboList.parent = this;
        this.index = 0;
    }

    get overlayBody(){ return this.comboList }

    get index() { return this._index; }
    set index( i:number ) {
        const newIndex = clamp( i, 0, this.options.length-1 );
        const changed = newIndex!=this._index;
        this._index = newIndex; 

        this.listItems.forEach( (item, childIndex)=>item.selected=newIndex==childIndex)

        if( changed ) this.onChange?.(newIndex);
    }

    override renderContents(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void { 

        this.myTransform = ctx.getTransform(); 
        this._width = maxWidth;

        this.roundedRect(ctx, 0,0, maxWidth, maxHeight , 3); 
        ctx.fillStyle = Theme.config.comboboxBgColor;
        ctx.fill() 

        ctx.lineWidth = 1;
        ctx.strokeStyle = Theme.config.comboStrokeColor;
        ctx.stroke();

        //#region chevron
        const iconH = 3;
        const s = 3;
        const x = maxWidth-10;
        const y = maxHeight / 2; 

        ctx.lineWidth = 1;
        ctx.strokeStyle = Theme.config.comboboxTextColor;

        ctx.beginPath();
        ctx.moveTo(x-s, y-iconH);
        ctx.lineTo(x,y);
        ctx.lineTo(x+s,y-iconH);
        ctx.stroke()
        //#endregion

        this.writeText( ctx, this.options[this._index], this.fontSize*0.8, 5, maxHeight, this.fontColor )

    }

    renderOverlay( ctx:CanvasRenderingContext2D ) {

        ctx.setTransform( this.myTransform );
        
        const comboHeight = this.comboList.height(ctx); 

        this.comboList.render( ctx, this._width, comboHeight ); 
    }

    protected onScroll(deltaY: number): void {
        console.log( deltaY)
        this.listLayout.scrollContent(deltaY);
    }

    override onMouseDown(cursorX: number, cursorY: number): void {
        (this.root as Node).editor.overlay = this; 
    }

    protected onOptionClicked( i:number ) {
        this.index = i; 
        (this.root as Node).editor.overlay = undefined; 
    }
}