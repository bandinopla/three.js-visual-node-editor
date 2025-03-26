import { Color, HSL } from "three";
import { InteractiveLayoutElement } from "../layout/InteractiveLayoutElement";
import { IOverlayRenderer } from "../layout/IOverlayRenderer";
import { Column, Layout, Row } from "../layout/Layout";
import { LayoutElement } from "../layout/LayoutElement";
import { Node } from "../nodes/Node";
import { ColorWheel } from "./ColorWheel";
import { HeaderElement } from "./Header";
import { ColorSwatch } from "./ColorSwatch";
import { DraggableValue } from "./DraggableValue";
import { Theme } from "../colors/Theme";
import { TextLabel } from "./TextLabel";
import { Button } from "./Button";

export class ColorPicker extends InteractiveLayoutElement  implements IOverlayRenderer {   

    private myTransform!:DOMMatrix;
    protected overlay:Layout;
    protected _color  = new Color() ;

    protected _opacity = 1;
    protected _saturation = 1;

    protected colorWheel:ColorWheel;
    protected colorSwatch:ColorSwatch;

    protected alphaSlider:DraggableValue;
    protected RGBSliders:DraggableValue[];
    protected HSLSliders:DraggableValue[];
    protected hexBtn:Button;
    private _emitInterval:number=0;

    private hsl:HSL = {h:0, s:0, l:0};

    constructor( private onColorChange?:(color:Color, opacity:number)=>void ) {
        super();
        this.backgroundColor = "black";

        this.colorWheel = new ColorWheel(this.onColorWheel.bind(this)); 
        this.colorSwatch = new ColorSwatch();
        this.alphaSlider = new DraggableValue("Alpha", true, 0, 1, 0.01, this.onAlphaSlider.bind(this));

        this.RGBSliders = ["R","G","B"].map((name,i)=>new DraggableValue(name, true, 0.001, 1, 0.01, this.onRGBSlider.bind(this, i)))
        this.HSLSliders = ["H","S","L"].map((name,i)=>new DraggableValue(name, true, 0.001, 1, 0.01, this.onHSLSlider.bind(this, i)))

        this.hexBtn = new Button("...", this.manuallySetHex.bind(this));

        this.overlay = new Column([
        
                        new Row([

                            new Column([ 
                                this.colorSwatch,
                                this.colorWheel 
                            ],{ 
                                align:"stretch"
                            }),

                            new Column([ 
                                this.alphaSlider,
                                ...this.RGBSliders,
                                ...this.HSLSliders
                            ],{ 
                                justify:"space-around",
                                align:"stretch",
                                width: 100,
                                gap:1,
                                lineHeight: Theme.config.nodeRowHeight * 0.7, 
                            })


                        ], { 
                            align:"stretch"
                        }),

                        this.hexBtn
                    ]);

        this.overlay.boxShadowLevel = 8
        this.overlay.backgroundColor = "#111"
        this.overlay.parent = this;
        this.overlay.xPadding = 2
        //
        // initial values...
        //
        this.opacity = 1;
        this.saturation = 1;
        this.color = new Color("black");  
    }

    get opacity() { return this._opacity; }
    set opacity( newOpacity:number ) 
    {
        this._opacity = newOpacity;
        this.colorSwatch.opacity = newOpacity;
        this.alphaSlider.value = newOpacity;
        this.emit();
    }

    get saturation() { return this._saturation; }
    set saturation( newSaturation:number ) 
    {
        this._saturation = newSaturation;
        this.colorWheel.saturation = newSaturation;
        this.HSLSliders[1].value = newSaturation;
        this.emit();
    }

    get color() { return this._color }
    protected set color( newColor:Color ) 
    {
        const c = this._color;

        c.copy( newColor );  
        c.getHSL( this.hsl );
 
        this.hsl.s = this._saturation;
        c.setHSL(this.hsl.h, this.hsl.s, this.hsl.l);

        this._color = c;

        this.colorWheel.color = this._color;
        this.colorSwatch.color = this._color;  
        
        const rgb = [c.r, c.g, c.b];
        this.RGBSliders.forEach( (slider,i)=>slider.value = rgb[i]);

        const hsl:number[] = Object.values( c.getHSL( this.hsl ) );

        this.HSLSliders.forEach( (slider, i)=>slider.value=hsl[i])

        this.hexBtn.label = this._color.getHexString();
        this.emit();
    }

    protected override renderContents(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {
        this.myTransform = ctx.getTransform(); 
        this.colorSwatch.render(ctx, maxWidth, maxHeight);
    }

    renderOverlay(ctx: CanvasRenderingContext2D): void {
        ctx.setTransform( this.myTransform );
        this.overlay.render( ctx, this.overlay.width(ctx), this.overlay.height(ctx) ); 
    }

    get overlayBody(): LayoutElement {
        return this.overlay;
    }

    override width(ctx: CanvasRenderingContext2D): number {
        return 50
    }

    override onMouseDown(cursorX: number, cursorY: number): void {
            
        (this.root as Node).editor.overlay = this; 
    }

    protected onColorWheel( color:Color ) {
 
        this.color = color; 
    }

    protected onAlphaSlider( newAlpha:number ) {
        this.opacity = newAlpha;
    }

    protected onRGBSlider( i:number, newValue:number ) {

        const c = this._color;
        const rgb = [c.r, c.g, c.b];
      
        rgb[i] = newValue;
      
        this.color = c.clone().setRGB(rgb[0], rgb[1], rgb[2]);
    }

    protected onHSLSlider( i:number, newValue:number ) {
 
        const c = this._color;
        const hsl:number[] = Object.values( c.getHSL( this.hsl ) );
        
        hsl[i] = newValue;
      
        if( i==1 ) {
            this.saturation = newValue;
        }

        this.color = c.clone().setHSL(hsl[0], this._saturation, hsl[2]);
    }

    protected manuallySetHex() {
        const val = prompt("Type the HEX value...", this._color.getHexString() );
        if( val )
        {
            this.color = this._color.clone().setStyle( "#"+val );
        }
    }

    private emit() {
        clearInterval(this._emitInterval);
        this._emitInterval = setTimeout(()=>{
            this.onColorChange?.( this.color, this.opacity );
        }, 0);
    }
}