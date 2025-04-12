import { DataTypeComboBox } from '../../components/DataTypeComboBox';
import { DataType, DataTypes, IDataType } from '../../core/IOutlet';
import { Script } from '../../export/Script';
import { BasicInputProperty } from '../../properties/BasicInputProperty';
import { ExecutableLogicNode } from './ExecutableLogicNode';
import { FunctionNode } from './FunctionNode';

export class FunctionOutputNode extends ExecutableLogicNode {
    protected dataType: DataTypeComboBox;
    protected returnValue: BasicInputProperty;

    constructor() {
        const dataType = new DataTypeComboBox((index) =>
            this.onTypeChange(index),
        );
        const returnValue = new BasicInputProperty(DataType.float, 'output');

        super('Return', [dataType, returnValue], false);

        this.dataType = dataType;
        this.returnValue = returnValue;
        this.canBeDeleted = false;

        this.returnValue.outletName = 'output';
    }

    protected onTypeChange(index: number) {
        this.returnValue.type =
            index < 1
                ? DataType.float
                : DataTypes.find((dt) => dt.name == 'vec' + (index + 1))!.type;
        this.instanceOf?.update();
    }

    override onAdded(): void {
        const master = this.instanceOf! as FunctionNode;

        master.output = this.returnValue;

        super.onAdded();
    }

    override get nodeDataType(): IDataType | undefined {
        return;
    }

    protected override writeNodeScript(script: Script): string {
        const outvalue = this.returnValue.writeScript(script);

        script.writeLine(`return ${outvalue}`);

        return ''; // we dont return any reference to anything.
    }

    override serialize(): Record<string, any> {
        return {
            outputType: this.dataType.index,
            ...super.serialize(),
        };
    }

    override unserialize(data: Record<string, any>): void {
        super.unserialize(data);
        this.dataType.index = data.outputType ?? 0;
        
    }
}
