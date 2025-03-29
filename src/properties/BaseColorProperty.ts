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

        this.colorPicker = new ColorPicker(()=>this.root.update());

        this.layout = new Layout([
            new TextLabel("Base Color"), 
            this.colorPicker
        ],{
            justify:"space-between"
        }); 

        this.xPadding = 10; 
    }

    protected override onConnected(to: IOutlet): void {
        this.colorPicker.enabled = false
    }

    protected override onDisconnected(from: IOutlet): void {
        this.colorPicker.enabled = true
    }

    override writeScript(script: Script): string {
        if( this.connectedTo )
        {
            return super.writeScript(script);
        }

        script.importModule("color");

        return script.define( this.outletName, `color(0x${ this.colorPicker.color.getHexString() })` )
    } 

}