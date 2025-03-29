import { Color } from "three";
import { Theme } from "../colors/Theme";
import { ColorPicker } from "../components/ColorPicker";
import { TextLabel } from "../components/TextLabel";
import { IOutlet } from "../core/IOutlet";
import { Script } from "../export/Script";
import { Layout } from "../layout/Layout";
import { Input } from "./Input";

export class BaseColorProperty extends Input {
 
    protected colorPicker:ColorPicker;

    constructor() {
        super(3); 

        this.colorPicker = new ColorPicker(()=>this.root.update(), false); 

        this.layout = new Layout([
            new TextLabel("Base Color"), 
            this.colorPicker
        ],{
            justify:"space-between"
        }); 

        //this.xPadding = 10; 
    } 

    get baseColor() {
        return this.colorPicker.color;
    }

    set baseColor( newColor:Color ) {
        this.colorPicker.color = newColor;
    }

    override writeScript(script: Script): string {

        let baseColor = `color(0x${ this.colorPicker.color.getHexString() })`;

        if( this.connectedTo )
        {
            baseColor = baseColor + `.mul(${ this.connectedTo.writeScript( script ) })`;
        }

        script.importModule("color");

        return script.define( this.outletName, baseColor )
    } 

}