import { Script } from '../../export/Script';
import { LayoutElement } from '../../layout/LayoutElement';
import { ExecutableLogicNodeHeader } from '../../properties/ExecutableLogicNodeHeader';
import { BaseLogicNode } from './BaseLogicNode';

/**
 * Base class to all executable logic nodes...
 */
export class ExecutableLogicNode extends BaseLogicNode {
    private nodeHeader: ExecutableLogicNodeHeader;

    constructor(
        title: string,
        childs: LayoutElement[],
        continuesExecution = true,
    ) {
        childs.unshift(
            new ExecutableLogicNodeHeader(title, continuesExecution),
        );

        super('', childs);

        this.nodeHeader = childs[0] as ExecutableLogicNodeHeader;
    }

    get previousNode() {
        return this.nodeHeader.previousNode;
    }

    get nextNode() {
        return this.nodeHeader.nextNode;
    }

    override width(ctx: CanvasRenderingContext2D): number {
        return super.width(ctx) / 2;
    }

    /**
     * travel from left to right, calling the writeBlockScript of every connected node.
     */
    writeBlockScript(script: Script): ExecutableLogicNode {
        this.writeScript(script);
        return this.nextNode?.writeBlockScript(script) ?? this;
    }
}
