import { DataType } from '../core/IOutlet';
import { Stack } from '../layout/Stack';
import { ExecutableLogicNode } from '../nodes/logic/ExecutableLogicNode';
import { BasicInputProperty } from './BasicInputProperty';
import { OutletProperty } from './OutletProperty';
import { Output } from './Output';

export class ExecutableLogicNodeHeader extends Stack {
    protected prevNodeOutlet: OutletProperty;
    protected nextNodeOutlet?: OutletProperty;

    constructor(
        readonly label: string,
        continuesExecution = true,
    ) {
        super([
            new BasicInputProperty(DataType.script, label),
            ...(continuesExecution ? [new Output('', DataType.script)] : []),
        ]);

        this.prevNodeOutlet = this.childs[0] as OutletProperty;
        this.nextNodeOutlet = this.childs[1] as OutletProperty;
    }

    get previousNode(): ExecutableLogicNode | undefined {
        return this.prevNodeOutlet.connectedTo?.owner as ExecutableLogicNode;
    }

    get nextNode(): ExecutableLogicNode | undefined {
        return this.nextNodeOutlet?.connectedTo?.owner as ExecutableLogicNode;
    }
}
