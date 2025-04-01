import { DraggableValue } from "../components/DraggableValue"; 
import { IOutlet, OutletSize } from "../core/IOutlet";
import { Script } from "../export/Script";
import { Layout, Row } from "../layout/Layout";
import { BasicInputProperty } from "./BasicInputProperty";
import { Input } from "./Input";

type Config = {
    min:number
    max:number
    step:number
    label:string
    asBar:boolean
}

export class InputOrValue extends BasicInputProperty 
{
    protected notConnectedContent:Layout;
    protected valueSlider:DraggableValue;

    constructor( size:OutletSize, label:string|Partial<Config>, protected onChange?:(v?:number)=>void ) {
 
        const hasConfig = typeof label!="string";

        const valConfig :Config = {
            min: Number.MIN_SAFE_INTEGER,
            max: Number.MAX_SAFE_INTEGER,
            step: 0.01,
            label: "",
            asBar: false,
            ...( !hasConfig?{}:label )
        }

        const lbl = !hasConfig? label : label.label;

        super( size, valConfig.label );

        this.valueSlider = new DraggableValue( valConfig.label, valConfig.asBar, valConfig.min, valConfig.max, valConfig.step, value => this.onChange?.(value) );

        this.notConnectedContent = new Row([
            this.valueSlider
        ]);

        //this.notConnectedContent.parent = this;
        this.layout = this.notConnectedContent;
        
    }

    get value() {
        return this.valueSlider.value;
    }

    set value( newValue:number ) {
        const changed = this.valueSlider.value!=newValue;
        
        if( changed )
        {
            this.valueSlider.value = newValue;
            this.onChange?.(newValue);
        }
            
    }

    override width(ctx: CanvasRenderingContext2D): number {
        if( this.connectedTo ) return super.width(ctx);
        return this.notConnectedContent.width(ctx)
    }

    protected override onConnected(to: IOutlet): void {
        this.layout = undefined;
        this.onChange?.();
    }

    protected override onDisconnected(from: IOutlet): void {
        this.layout = this.notConnectedContent;
        this.onChange?.( this.valueSlider.value );
    }

    override writeScript(script: Script): string {
        if( this.connectedTo )
        {
            return this.connectedTo.writeScript( script );
        }

        script.importModule("float");
        return `float(${ this.valueSlider.stringValue })`
    }
}