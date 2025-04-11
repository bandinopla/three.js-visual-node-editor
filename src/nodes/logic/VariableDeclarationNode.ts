import { ChangeNodeCustomNameButton } from '../../components/ChangeNodeCustomNameButton';
import { DataType, IDataType } from '../../core/IOutlet';
import { Script } from '../../export/Script';
import { BasicInputProperty } from '../../properties/BasicInputProperty';
import { Output } from '../../properties/Output';
import { ExecutableLogicNode } from './ExecutableLogicNode';
import { FunctionNode } from './FunctionNode';

/**
 * A node that declares a variable. Like when in js you do: const foo = "bar"
 */
export class VariableDeclarationNode extends ExecutableLogicNode {
    protected input: BasicInputProperty;
    protected output: Output;

    readonly isVarNode = true;

    constructor() {
        const input = new BasicInputProperty(DataType.wildcard, '=');
        const output = new Output('Get', DataType.wildcard);

        super('VAR', [input, output, new ChangeNodeCustomNameButton()]);

        this.input = input;
        this.output = output;
    }

    override onAdded(): void {
        if (!this.customNodeName) {
            this.customNodeName = (
                this.childOf as FunctionNode
            ).getValidParameterName('noName');
        }
    }

    override get nodeDataType(): IDataType | undefined {
        return this.input.type;
    }

    protected override writeNodeScript(script: Script): string {
        const value = this.input.writeScript(script) + '.toVar()';

        return script.define(this.nodeName, value);
    }
}
