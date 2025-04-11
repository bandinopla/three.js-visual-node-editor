import { Theme } from '../../colors/Theme';
import { ChangeNodeCustomNameButton } from '../../components/ChangeNodeCustomNameButton';
import { DataTypeComboBox } from '../../components/DataTypeComboBox';
import { IOutlet, DataType, DataTypes } from '../../core/IOutlet';
import { LayoutElement } from '../../layout/LayoutElement';
import { BasicInputProperty } from '../../properties/BasicInputProperty';
import { OutletProperty } from '../../properties/OutletProperty';
import { Output } from '../../properties/Output';
import { WinNode } from '../WinNode';
import { FunctionNode } from './FunctionNode';

/**
 * Data flow as in, data that travel to or from a function node. Think of a parameter vs a return value.
 */
export class FunctionDataFlowNode extends WinNode {
    protected childs: LayoutElement[];

    /**
     * The "outlet" of this node. Meaning, the outlet that this data either takes as input or outputs.
     */
    readonly outlet: IOutlet;
    protected defaultValueOutlet?: IOutlet;
    protected master!: FunctionNode;
    protected dataTypeCombo: DataTypeComboBox;

    /**
     * @param isInput if true it is a function parameter, false it means it is data that the function returns.
     */
    constructor(
        protected isInput: boolean,
        protected hideName = false,
    ) {
        const childs: LayoutElement[] = [
            new DataTypeComboBox((newType) => this.onTypeComboChange(newType)),
            new BasicInputProperty(
                DataType.wildcard,
                isInput ? 'default' : 'Output',
            ),
        ];

        if (isInput) {
            childs.push(new Output('value', DataType.wildcard));
        }

        if (!hideName)
            childs.push(
                new ChangeNodeCustomNameButton((newName) =>
                    this.changeName(newName),
                ),
            );

        super(isInput ? 'Input' : 'Output', Theme.config.groupFunction, childs);

        this.childs = childs;
        this.outlet = (isInput
            ? childs[childs.length - 2]
            : childs[1]) as unknown as IOutlet;
        this.dataTypeCombo = childs[0] as DataTypeComboBox;

        if (isInput) {
            this.defaultValueOutlet = childs[1] as unknown as IOutlet;
        }

        if (!hideName) {
            this.customNodeName = this.outlet.outletName;
            (this.outlet as BasicInputProperty).addEventListener(
                'renamed',
                (ev) => (this.customNodeName = ev.newName),
            );
        }
    }

    override onAdded(): void {
        this.master = this.childOf as FunctionNode;

        if (!this.master) {
            throw new Error(
                `This node can only be created inside of a function node...`,
            );
        }

        this.outlet.outletName = this.master.getValidParameterName(
            this.isInput ? 'param' : 'output',
        );

        super.onAdded();
    }

    // override render(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {

    //     //draw the name of the variable.

    //     if( !this.hideName )
    //     this.drawParamName(ctx, maxWidth, maxHeight);

    //     super.render(ctx, maxWidth, maxHeight);
    // }

    // protected drawParamName(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number) {
    //     const pad = 3;
    //     const vname = this.outlet.outletName;
    //     const h = Theme.config.nodeRowHeight ;
    //     ctx.fillStyle = Theme.config.paramNameBgColor;

    //     ctx.fillRect( 0,-h, ctx.measureText(vname).width+pad*2 , h);
    //     this.writeText(ctx, vname, Theme.config.fontSize , pad, -h-pad, Theme.config.paramNameTextColor);
    // }

    override width(ctx: CanvasRenderingContext2D): number {
        return super.width(ctx) / 2;
    }

    protected onTypeComboChange(newType: number) {
        const outputs = this.childs.filter(
            (child) => child instanceof OutletProperty,
        );
        const dataType =
            newType < 2
                ? DataType.float
                : DataTypes.find((dt) => dt.name == 'vec' + newType)!.type;

        outputs.forEach((outlet) => (outlet.type = dataType));

        this.update();
    }

    override update(): void {
        this.master.update();
    }

    protected changeName(newName: string) {
        this.outlet.outletName = this.master.getValidParameterName(newName);
        this.update();
    }

    override serialize(): Record<string, any> {
        return {
            dataType: this.dataTypeCombo.index,
            outletName: this.outlet.outletName,
            ...super.serialize(),
        };
    }

    override unserialize(data: Record<string, any>): void {
        this.dataTypeCombo.index = data.dataType ?? 0;
        this.outlet.outletName = data.outletName;
        super.unserialize(data);
    }
}
