import { DataType, IDataType } from '../../core/IOutlet';
import { Script } from '../../export/Script';
import { BasicInputProperty } from '../../properties/BasicInputProperty';
import { OutletProperty } from '../../properties/OutletProperty';
import { Output } from '../../properties/Output';
import { ExecutableLogicNode } from './ExecutableLogicNode';

/**
 * A node that behaves like an IF statement
 */
export class IfNode extends ExecutableLogicNode {
    private conditionOutlet: OutletProperty;
    private trueOutlet: OutletProperty;
    private falseOutlet: OutletProperty;

    constructor() {
        const condition = new BasicInputProperty(DataType.bool, `is "true"`);
        const trueOutlet = new Output('Run', DataType.script);
        const falseOutlet = new Output('Else', DataType.script);

        super('IF', [condition, trueOutlet, falseOutlet]);

        this.conditionOutlet = condition;
        this.trueOutlet = trueOutlet;
        this.falseOutlet = falseOutlet;
    }

    override get nodeDataType(): IDataType | undefined {
        return;
    }

    protected override writeNodeScript(script: Script): string {
        script.importModule('If');

        const condition =
            this.conditionOutlet.writeScript(script) + '.toBool()';

        const trueBlock = this.writeIfBlock(this.trueOutlet, script);
        const elseBlock = this.writeIfBlock(this.falseOutlet, script);

        //
        // the actual TSL if...
        // 
        script.writeLine(
            `If(${condition}, ()=>{ ${trueBlock} })${elseBlock ? `.Else(()=>{ ${elseBlock} })` : ''}`,
        );

        return '';
    }

    /**
     * From this outlet property, write the script that the node this lead us to contains.
     * @param outlet the ui that holds the reference to the outflow outlet
     * @param script the context script we are using to write...
     * @returns
     */
    private writeIfBlock(outlet: OutletProperty, script: Script) {
        if (!outlet.connectedTo) return undefined;

        const blockcope = script.newScope(true);

        (outlet.connectedTo.owner as ExecutableLogicNode).writeBlockScript(
            script,
        );

        blockcope.exit();

        return blockcope.toString();
    }
}
