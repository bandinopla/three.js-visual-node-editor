import { Theme } from '../../colors/Theme';
import { Button } from '../../components/Button';
import { IOutlet, DataType, IDataType } from '../../core/IOutlet';
import { Row } from '../../layout/Layout';
import { Output } from '../../properties/Output';
import { WinNode, WinNodeEvents } from '../WinNode';
import { FunctionOutputNode } from './FunctionOutputNode';
import { FunctionNodeEvents } from './FunctionEvents';
import { Node } from '../Node';
import { FunctionDataFlowNode } from './FunctionDataFlowNode';
import { NameManager } from '../../util/nameManager';
import { Script } from '../../export/Script';
import { ExecutableLogicNode } from './ExecutableLogicNode';
import { getNodeTypeById } from '../../EditorNodes';
import { ChangeNodeCustomNameButton } from '../../components/ChangeNodeCustomNameButton';

/**
 * A function node is a node that contains nodes that will be executed one after the other following a flow determined by the connecting square sockets...
 * A function can have nodes that act as callers, that call this function.
 * The callers are in-sync with the master function node, to update both their inputs and outputs.
 */
export class FunctionNode extends WinNode<FunctionNodeEvents & WinNodeEvents> {
    readonly inputs: IOutlet[] = [];

    /**
     * Set by a child node... will describe the data type this function returns.
     */
    protected _output?: IOutlet;
    get output() {
        return this._output;
    }
    set output(newOutput: IOutlet | undefined) {
        const changed = this._output != newOutput;
        this._output = newOutput;
        if (changed) this.update();
    }

    /**
     * Used to name out parameters
     */
    protected namesManager: NameManager;
    protected executeOutlet: Output;

    /**
     * Set by the output node. Use to know if the output was reached...
     */
    lastLogicNode?: ExecutableLogicNode;

    constructor(protected master?: FunctionNode) {
        super('Function', Theme.config.groupFunction, [
            new ChangeNodeCustomNameButton(newName => this.rename(newName)),
            new Button('+ Input', () => this.createDataFlowNode(true)),
            //new Button("+ Output", ()=>this.createOutputNode()),
            new Output('Execute', DataType.script),
            //new Divider(""),
            new Row([
                new Button('Delete', () => this.deleteNode(), {
                    background: Theme.config.dangerBgColor,
                }),
                new Button('X - Close', () => this.editor.exitCurrentNode()),
            ]),
        ]);

        this.namesManager = new NameManager();
        this.executeOutlet = this.getChildOfType(Output)!;
    }

    protected rename(newName: string) {
        this.customNodeName = this.editor.getSafeName(this, newName);
        this.update()
    }

    override onAdded(): void {
        setTimeout(() => {
            const OutputNodeClass = getNodeTypeById('fn-output')!.TypeClass;

            const hasOutput = this.editor.findVisibleNode(
                (node) => node instanceof OutputNodeClass,
            );
            if (!hasOutput) {
                const output = new OutputNodeClass();
                output.x = this.x + 200;
                output.y = this.y;
                output.instanceOf = this;

                this.editor.add(output);
            }
        }, 0);

        if (!this.customNodeName) {
            this.customNodeName = this.editor.getSafeName(this, 'unnamed');
        }
    }

    override createInstanceNode(): Node {
        const instance = new (getNodeTypeById('fn-call')!.TypeClass)();
        instance.instanceOf = this;
        return instance;
    }

    override get canBeInstantiated(): boolean {
        return true;
    }

    getValidParameterName(desiredName: string) {
        return this.namesManager.getName(desiredName);
    }

    protected createDataFlowNode(isInput: boolean) {
        const channel = isInput ? this.inputs : [];
        const index = channel.length;

        const NodeType = getNodeTypeById(
            isInput ? 'fn-param' : 'fn-output',
        )!.TypeClass;

        const node = new NodeType() as FunctionDataFlowNode;
        const master = this;

        node.addEventListener('removed', function onRemoved() {
            node.removeEventListener('removed', onRemoved);

            channel.splice(index, 1);
            master.update();
        });

        channel.push(node.outlet);

        this.editor.quickAdd(node);
        this.update();
    }

    override update(): void {
        this.dispatchEvent({ type: 'update' });
    }

    override get nodeDataType(): IDataType | undefined {
        return this.executeOutlet.type;
    }

    protected override writeNodeScript(script: Script): string {
        script.importModule(['Fn', 'float', 'vec3']);

        //
        // a function scope can't share scope wth the outside... it is it's own little bubble.
        //
        const fScope = script.newScope(false);

        script.define('output', '{}'); // output nodes will write to this object (in the js generated...).

        //
        // this will recurively move forward (left to right) calling each connected logic block (vía the square icon outlet) and asking it to write it's script.
        //
        const lastNode = (
            this.executeOutlet.connectedTo?.owner as ExecutableLogicNode
        )?.writeBlockScript(script);

        if (!(lastNode instanceof FunctionOutputNode)) {
            throw new Error(
                'The last conected node must be a function output node.',
            );
        }

        const returns = '';

        // if( this.outputs.length )
        // {

        //     //
        //     // look for all the not generated output nodes ( output nodes not connected to the master function node ), and generate them.
        //     //
        //     this.outputs.filter( output=>!script.isCached( output.owner ))
        //                 .forEach( output => {

        //                     // tell the node to write it's script
        //                     try
        //                     {
        //                         output.owner.writeScript( script );
        //                     }
        //                     catch(err) {
        //                         const errString = err instanceof Error? err.message : err as string;

        //                         this.dispatchEvent({ type:"error", outlet: output, message:"Function output error: "+ errString});

        //                         throw err;
        //                     }

        //                 } ); //<-- function output nodes will assign their inputs to "output[outletName]"

        //     returns = "output"; // the "output" object that holds the properties each "ouput" node will (should) set.
        // }

        fScope.exit();

        return script.defineFunction(
            fScope,
            this.nodeName,
            this.inputs.length > 0,
            returns,
        );
    }

    protected deleteNode() {
        if (
            confirm('Deleting this node will also delete all instances of it.')
        ) {
            this.editor.remove(this);
        }
    }
}
