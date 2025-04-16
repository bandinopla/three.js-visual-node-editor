import { DataType, IDataType } from '../../core/IOutlet';
import { Script } from '../../export/Script'; 
import { InputOrValue } from '../../properties/InputOrValue'; 
import { Output } from '../../properties/Output';
import { ExecutableLogicNode } from './ExecutableLogicNode';

/**
 * A node that behaves like an IF statement
 */
export class ForNode extends ExecutableLogicNode {
   
    private count: InputOrValue; 
    private loopIndex: Output; 
    private execute: Output; 

    constructor() {
        const count = new InputOrValue("Count");
        const loopIndex = new LoopIndexOutput();
        const execute = new Output('Execute', DataType.script); 

        super('Loop', [count, execute, loopIndex ]);
 
        this.count = count;
        this.execute = execute;
        this.loopIndex = loopIndex;
    }

    override get nodeDataType(): IDataType | undefined {
        return;
    }

    protected override writeNodeScript(script: Script): string {
        script.importModule('Loop');
 
        const count = this.count.writeScript(script);
        const blockcope = script.newScope(true);

        //execute
        (this.execute.connectedTo?.owner as ExecutableLogicNode).writeBlockScript( script );

        blockcope.exit();

        //
        // the actual TSL if...
        // 
        script.writeLine( `Loop(${ count }, ({ i:${ this.nodeName+"_i" } })=>{ ${ blockcope.toString() } })`);

        return '';
    }

    override serialize(): Record<string, any> {
        return {
            count: this.count.value,
            ...super.serialize()
        }
    }

    override unserialize(data: Record<string, any>): void {
        super.unserialize(data)
        this.count.value = data.count ?? 0;

    }
 
}

class LoopIndexOutput extends Output {
    constructor() {
        super("i", DataType.uint);
    }

    override writeScript(): string {
        return this.owner.nodeName+"_i";
    }
}
