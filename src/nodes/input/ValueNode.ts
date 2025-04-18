import { DataTypeComboBox } from '../../components/DataTypeComboBox';
import { DataType, DataTypes, IDataType } from '../../core/IOutlet';
import { Script } from '../../export/Script';
import { InputOrValue } from '../../properties/InputOrValue';
import { Output } from '../../properties/Output';
import { InputBaseNode } from './InputBaseNode';
/**
 * A number, either a float or an int...
 */
export class ValueNode extends InputBaseNode {
    protected inputs: InputOrValue[];
    protected output: Output;
    protected typeCombo:DataTypeComboBox;

    constructor(acceptsInputs = true) {
        const lbl = ['X', 'Y', 'Z', 'W'];
        const inputs = Array.from({ length: 4 }).map(
            (_, i) => new InputOrValue(lbl[i], undefined, acceptsInputs),
        );

        super('Value', [
            new DataTypeComboBox((val) => (this.size = val+1 )),
            ...inputs,
            new Output('value', DataType.wildcard),
        ]);

        this.typeCombo = this.getChildOfType(DataTypeComboBox)!;
        this.inputs = inputs;
        this.output = this.getChildOfType(Output)!;
        this.size =1;
    }

    get size() {
        return this.inputs.filter((inp) => inp.enabled).length;
    }
    set size(n: number) {
        this.inputs.forEach((input, i) => {
            input.enabled = i < n;
        });

        this.output.updateType();
    }

    override width(ctx: CanvasRenderingContext2D): number {
        return super.width(ctx) / 2;
    }

    override get nodeDataType(): IDataType | undefined {
        const size = this.size;
        return size <= 1
            ? DataType.float
            : DataTypes.find((dt) => dt.name == 'vec' +  size )!.type;
    }

    protected override writeNodeScript(script: Script): string {
        const size = this.size;
        const single = size <= 1;

        script.importModule(single ? `float` : `vec${size}`);

        const values = this.inputs
            .filter((input) => input.enabled)
            .map((input) => input.writeScript(script));

        return script.define(
            this.nodeName,
            single ? values[0] : `vec${size}(${values.join(',')})`,
        );
    }

    override serialize(): Record<string, any> {
        return {
            size: this.size,
            values: this.inputs.map((input) => input.value),
            ...super.serialize(),
        };
    }

    override unserialize(data: Record<string, any>): void {
        super.unserialize(data); 
        data.values?.forEach((value: number, i: number) => {
            this.inputs[i].value = value;
        });

        this.size = data.size ?? 1;
        
    }
}
