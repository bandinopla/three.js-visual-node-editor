import { IDataType, IOutlet } from '../../core/IOutlet';
import { Script } from '../../export/Script';
import { Column } from '../../layout/Layout';
import { BasicInputProperty } from '../../properties/BasicInputProperty';
import { OutletProperty } from '../../properties/OutletProperty';
import { Output } from '../../properties/Output';
import { BaseLogicNode } from './BaseLogicNode';
import { FunctionNodeEvents } from './FunctionEvents';
import { FunctionNode } from './FunctionNode';

export class FunctionCallNode extends BaseLogicNode {
    protected onMasterUpdate: VoidFunction;
    protected onMasterErrorListener: (err: FunctionNodeEvents['error']) => void;
    protected inputProps: Column;
    protected outputProps: Column;
    protected master!: FunctionNode;

    /**
     * Map every outlet of the master node to the corresponding mirroed outlet in this node.
     */
    protected outlet2property: Map<IOutlet, OutletProperty>;

    constructor() {
        super('Function call', [
            new Column([], { align: 'stretch' }),
            new Column([], { align: 'stretch' }),
        ]);

        this.outlet2property = new Map();

        this.inputProps = this.getChildOfType(Column)!;
        this.outputProps = this.getChildOfType(Column, 1)!;

        this.onMasterUpdate = this.update.bind(this);
        this.onMasterErrorListener = this.onMasterError.bind(this);
    }

    override get nodeName(): string {
        return this._nodeName;
    }

    override onAdded(): void {
        const master = this.instanceOf as FunctionNode;

        console.log('FUNCTION CALL NODE: ', master);

        this.master = master;

        master.addEventListener('update', this.onMasterUpdate);
        master.addEventListener('error', this.onMasterErrorListener);

        this.update();
    }

    protected onMasterError(err: FunctionNodeEvents['error']) {
        this.outlet2property.get(err.outlet)!.error = err.message;
    }

    override onRemoved(): void {
        this.master.removeEventListener('update', this.onMasterUpdate);
        this.master.removeEventListener('error', this.onMasterErrorListener);
    }

    /**
     * The idea is that the master node has changed its inputs and/or outputs (the user did it...),
     * and since we are a mirror of the master, we must sync our UI to reflect the same inputs and outputs.
     */
    protected resync(
        outletPropsLayout: Column,
        outlets: IOutlet[],
        asInput: boolean,
    ) {
        //
        // remove deleted outlets. Refresh MAP and remove properties deferencing the deleted outlets.
        //
        this.outlet2property.forEach((ui, outlet) => {
            // because in the function node an "input" parameter will be an output outlet. And viceversa.
            if (outlet.isInput == asInput) return;

            if (!outlets.includes(outlet)) {
                this.outlet2property.delete(outlet);
                outletPropsLayout.removeChild(ui);
            }
        });

        //
        // now we can just create the new ones...
        //
        outlets.forEach((newOutlet) => {
            const outletName = newOutlet.outletName;
            const existing = this.outlet2property.get(newOutlet);

            if (existing) {
                existing.type = newOutlet.type;
                (existing as any).label = outletName;

                return;
            }

            const labelName = outletName ?? '???';
            const outletProperty: OutletProperty = asInput
                ? new BasicInputProperty(newOutlet.type, labelName)
                : new Output(labelName, newOutlet.type);

            (outletProperty as any).label = outletName;

            this.outlet2property.set(newOutlet, outletProperty);
            outletPropsLayout.addChild(outletProperty);
        });
    }

    override update(): void {
        this.resync(this.inputProps, this.master.inputs, true);

        if (this.master.output) {
            this.outputProps.enabled = true;
            this.resync(this.outputProps, [this.master.output!], false);
        } else {
            this.outputProps.enabled = false;
        }

        this.customNodeName = this.master.nodeName + ' ( )';
        this.recalculateOutlets();

        super.update();
    }

    override get nodeDataType(): IDataType | undefined {
        return this.master.nodeDataType;
    }

    protected override writeNodeScript(script: Script): string {
        const func = this.master.writeScript(script);

        const inputs = this.master.inputs.map(
            (iOutlet) =>
                `${iOutlet.outletName}:${this.writeFunctionParameterValue(script, iOutlet)}`,
        );

        const inputParams = inputs.length
            ? `{ \n${inputs.join(`,\n`)}\n }`
            : '';

        return script.define(this.nodeName, `${func}(${inputParams})`);
    }

    protected writeFunctionParameterValue(
        script: Script,
        masterInput: IOutlet,
    ) {
        const myOutlet = this.outlet2property.get(masterInput);

        if (myOutlet?.connectedTo) {
            return myOutlet.writeScript(script);
        } else {
            //use default value...
            return masterInput.writeScript(script);
        }
    }
}
