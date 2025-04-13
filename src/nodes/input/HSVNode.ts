 
import { DataType, IDataType } from '../../core/IOutlet';
import { Script } from '../../export/Script';
import { ValueNode } from './ValueNode';


export class HSVNode extends ValueNode { 

    constructor() { 
        super()
        this.size = 3;
        
        this.setTitle("HSV")
        this.typeCombo.enabled = false;
        this.inputs.forEach( (input,i)=>input.label="HSV"[i])
    }
  
    override get nodeDataType(): IDataType | undefined {
        return DataType.vec3;
    }

    protected override writeNodeScript(script: Script): string {
  
        script.importModule( ["vec3","mx_hsvtorgb"]);

        const values = this.inputs
            .filter((input) => input.enabled)
            .map((input) => input.writeScript(script));

        return script.define(
            this.nodeName,
            `mx_hsvtorgb(vec3(${values.join(',')}))`,
        );
    }
}
