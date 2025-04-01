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
    defaultValue:number
}

export class InputOrValue extends BasicInputProperty 
{
    protected notConnectedContent:Layout;
    protected valueSlider:DraggableValue;

    /**
     * If true, whatever input value will be multiplied by our value
     */
    multiplyInputWithValue = false;

    constructor( size:OutletSize, label:string|Partial<Config>, protected onChangeListener?:(v?:number)=>void ) {
 
        const hasConfig = typeof label!="string";

        const valConfig :Config = {
            min: Number.MIN_SAFE_INTEGER,
            max: Number.MAX_SAFE_INTEGER,
            step: 0.01,
            label: "",
            asBar: false,
            defaultValue:0,
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
        
        this.valueSlider.value = valConfig.defaultValue;
    }

    /**
     * Inform the listner or if no listener was passed, then inform the top-most node that "something has changed"
     */
    protected onChange( val?:number ) {
        if( this.onChangeListener )
        {
            this.onChangeListener( val );
        }
        else 
        {
            this.root.update();
        }
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
        if( !this.multiplyInputWithValue )
            this.layout = undefined;

        this.onChange?.();
    }

    protected override onDisconnected(from: IOutlet): void {
        if( !this.multiplyInputWithValue )
            this.layout = this.notConnectedContent;

        this.onChange?.( this.valueSlider.value );
    }

    override writeScript(script: Script): string {

        script.importModule("float"); 

        const val = `float(${ this.valueSlider.stringValue })`;

        if( this.connectedTo )
        {
            return this.connectedTo.writeScript( script ) + ( this.multiplyInputWithValue? `.mul(${val})` :"");
        } 
        

        return val;
    }
}