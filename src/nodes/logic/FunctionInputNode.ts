import { IDataType } from '../../core/IOutlet';
import { Script } from '../../export/Script';
import { FunctionDataFlowNode } from './FunctionDataFlowNode';

export class FunctionInputNode extends FunctionDataFlowNode {
    constructor() {
        super(true);
    }

    override onAdded(): void {
        super.onAdded()
        this.master.registerInput( this );
    }

    protected override writeNodeScript(script: Script): string {
        const vname = this.outlet.outletName;
        const val = script.define(
            vname,
            `params.${vname} ?? ${this.defaultValueOutlet?.writeScript(script) ?? 'float(0)'}`,
        );

        return val;
    }

    override get nodeDataType(): IDataType | undefined {
        return this.outlet.type;
    }
}
