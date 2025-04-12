import { FillStyle, Theme } from '../colors/Theme';
import { HeaderElement } from '../components/Header';
import { Layout } from '../layout/Layout';
import { LayoutElement } from '../layout/LayoutElement';
import { slugifyToFunctionName } from '../util/slugifyToFunctionName';
import { Node, NodeEvents } from './Node';

/**
 * Keep track of node name use so we can create unique names for each node.
 */
const nameCount: Record<string, number> = {};

export type WinNodeEvents = { titleChanged: {} } & NodeEvents;

export class WinNode<T extends WinNodeEvents = WinNodeEvents> extends Node<
    T & WinNodeEvents
> {
    protected _nodeName: string;

    /**
     * A custom name for the variable to be used when writing this node's value into javascript
     */
    customNodeName?: string;

    protected header: HeaderElement;

    constructor(
        protected title: string,
        groupColor: FillStyle,
        protected childs: LayoutElement[],
    ) {
        const header = new HeaderElement(title, groupColor);

        super(
            new Layout(
                [
                    header,
                    new Layout(childs, {
                        direction: 'column',
                        gap: 5,
                        xPadding: Theme.config.nodeMargin,
                        align: 'stretch',
                        offsetY:
                            title == '' ? -Theme.config.nodeRowHeight - 5 : 0,
                    }),
                ],
                {
                    direction: 'column',
                    align: 'stretch',
                },
            ),
        );

        //#region crate a name for this node
        let name =
            'node_' +
            slugifyToFunctionName(
                title == '' ? (childs[0] as any).label : title,
            );

        if (nameCount[name]) {
            // increment counter and append the trailing count to make the name unique...
            name += (++nameCount[name]).toString().padStart(3, '0');
        } else {
            nameCount[name] = 1;
        }

        this._nodeName = name;
        this.header = header;
        //#endregion
    }

    override get nodeName(): string {
        return this.customNodeName ?? this._nodeName;
    }

    override render(
        ctx: CanvasRenderingContext2D,
        maxWidth: number,
        maxHeight: number,
    ): void {
        this.drawTag(ctx);
        super.render(ctx, maxWidth, maxHeight);
    }

    /**
     * Draw that tag on top of the win node that shows the custom name of the node. Used to display function's name, parameter's name, etc anything
     * that needs a custom name.
     */
    protected drawTag(ctx: CanvasRenderingContext2D) {
        if (!this.customNodeName) return;

        const pad = 3;
        const vname = this.customNodeName;
        const h = Theme.config.nodeRowHeight;
        const fSize = this.fontSize * 1.3;

        ctx.fillStyle = Theme.config.paramNameBgColor;
        ctx.font = fSize + 'px ' + Theme.config.fontFamily;

        this.roundedRect(
            ctx,
            0,
            -h - pad * 2,
            ctx.measureText(vname).width + pad * 2,
            h,
            5,
        );
        ctx.fill();

        //ctx.fillRect( 0,-h-pad*2, ctx.measureText(vname).width+pad*2 , h);
        this.writeText(
            ctx,
            vname,
            fSize,
            pad,
            -h - pad * 4,
            Theme.config.paramNameTextColor,
        );
    }

    protected setTitle(newTitle: string) {
        this.header.title = newTitle;
        this.dispatchEvent({ type: 'titleChanged' });
    }

    protected getChildOfType<T>(
        constructor: new (...args: any[]) => T,
        pos = 0,
    ): T | undefined {
        const matches = this.childs.filter(
            (child) => Object.getPrototypeOf(child).constructor === constructor,
        ); //child instanceof constructor);
        return matches[pos] as T | undefined;
    }

    override serialize(): Record<string, any> {
        return {
            customName: this.customNodeName,
            name: this._nodeName,
            ...super.serialize(),
        };
    }

    override unserialize(data: Record<string, any>): void {
        super.unserialize(data);
        this.customNodeName = data.customName;
        this._nodeName = data.name; 
    }
}
