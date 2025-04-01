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

    constructor( title="Base Color", defaultColor?:Color , protected multipliesInput = true) {
        super(3); 

        this.colorPicker = new ColorPicker(()=>this.root.update(), false); 

        this.layout = new Layout([
            new TextLabel(title), 
            this.colorPicker
        ],{
            justify:"space-between"
        }); 

        //this.xPadding = 10; 
        if( defaultColor )
            this.baseColor = defaultColor;
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
            const input = this.connectedTo.writeScript( script );
            baseColor = ( this.multipliesInput? `${baseColor}.mul(${ input })` : input );
        }

        script.importModule("color");

        return script.define( this.outletName, baseColor )
    } 

}