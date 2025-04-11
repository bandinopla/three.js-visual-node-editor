import { DataType, IDataType } from '../../core/IOutlet';
import { Script } from '../../export/Script';
import { BasicInputProperty } from '../../properties/BasicInputProperty';
import { ExecutableLogicNode } from './ExecutableLogicNode';

/**
 * A node that assins a value to an existing variable. We do not declare a variable, we assing a value to one.
 */
export class VariableValueAssignment extends ExecutableLogicNode {
    protected varOutlet: BasicInputProperty;
    protected varValue: BasicInputProperty;

    constructor() {
        const varOutlet = new BasicInputProperty(DataType.wildcard, 'VAR');
        const varValue = new BasicInputProperty(DataType.wildcard, 'Value');

        super('ASSIGN', [varOutlet, varValue]);

        this.varOutlet = varOutlet;
        this.varValue = varValue;

        varOutlet.addEventListener('connected', (ev) => {
            if (!('isVarNode' in ev.to.owner)) {
                ev.target.error = 'Input connecton must be a variable node.';
            }
        });

        varOutlet.addEventListener('disconnected', (ev) => {
            ev.target.error = undefined;
        });
    }

    override update(): void {
        const type = this.varOutlet.connectedTo
            ? this.varOutlet.type
            : this.varValue.connectedTo
                ? this.varValue.connectedTo.type
                : DataType.wildcard;

        if (!this.varOutlet.connectedTo) this.varOutlet.type = type;
        if (!this.varValue.connectedTo) this.varValue.type = type;

        super.update();
    }

    override get nodeDataType(): IDataType | undefined {
        return this.varOutlet.type;
    }

    protected override writeNodeScript(script: Script): string {
        const varRef = this.varOutlet.writeScript(script);

        if (varRef) {
            const newValue = this.varValue.writeScript(script);

            if (newValue) {
                script.writeLine(`${varRef}.assign( ${newValue} )`);
            }
        }

        return '';
    }
}
