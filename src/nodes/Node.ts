import { BaseEvent, EventDispatcher, Object3DEventMap } from 'three';
import { Theme } from '../colors/Theme';
import { IDataType, IOutlet } from '../core/IOutlet';
import { isOutlet } from '../core/isOutlet';
import { Editor } from '../Editor';
import { IScript } from '../export/IScript';
import { Script } from '../export/Script';
import { Layout } from '../layout/Layout';
import { LayoutElement } from '../layout/LayoutElement';

export type NodeEvents = {
    added: {};
    removed: {};
};

export class Node<MyEvents extends NodeEvents = NodeEvents>
    extends LayoutElement<MyEvents & NodeEvents>
    implements IScript
{
    editor!: Editor;

    private _type:string|undefined;
    set type( nodeTYpe:string ) {
        if(!this._type) this._type=nodeTYpe;
        else throw new Error(`Node ${this.nodeName} already has a type ${nodeTYpe}, you can't set the type again (to ${nodeTYpe})`);
    }
    get type() { 
        return this._type ?? "";
    }

    /**
     * ... by the user...
     */
    canBeDeleted = true;

    /**
     * This is a reference to the node inside of which we are being created.
     */
    public childOf?: Node;

    /**
     * A node created vía `createInstanceNode` should set this variable.
     * Ideally the contructor of a child node should accept it's master node in the first param to keep a relationship
     *
     */
    instanceOf: Node | undefined;
    get canBeInstantiated() {
        return false;
    }

    /**
     * If this node can have childrens inside (like a function node) this will be called when the user double clicks it to edit it's contents
     */
    onEntered() {}
    onExited() {}

    /**
     * Should return a node that is an "instance" of this node (not literally an instance, but a node that is meant to act like this node but with diferent parameters.)
     */
    createInstanceNode(): Node {
        throw new Error(`I (${this.nodeName}) don't instantiate...`);
    }

    /**
     * Mostly used to visually show a sign that this node is selected
     */
    selected = false;

    x = 0;
    y = 0;

    get nodeName(): string {
        throw new Error('Not implemented...');
    }

    override width(_ctx: CanvasRenderingContext2D): number {
        return 150;
    }

    protected _outlets: IOutlet[] = [];

    constructor(layout: Layout) {
        super();

        this.layout = layout;
        layout.parent = this;
    }

    height(ctx: CanvasRenderingContext2D) {
        return this.layout!.height(ctx) + 5;
    }

    draw(ctx: CanvasRenderingContext2D) {
        // our position
        ctx.translate(this.x, this.y);

        // each child will have a width and a height....
        const height = this.height(ctx);

        this.renderPanelBox(ctx, height);

        // render each child...
        this.render(ctx, this.width(ctx), height);

        this.recalculateOutlets();
    }

    /**
     * based on the current state of the node (it's layout) scan for the outlets available.
     */
    recalculateOutlets() {
        //
        // collect outlets... because they can be enabled or disabled, who knows... every render we re-collect.
        //
        this._outlets.length = 0;
        this.layout!.traverse((elem) => {
            if (isOutlet(elem) && elem.acceptsInputs) {
                this._outlets.push(elem);
            }
        });
    }

    protected renderPanelBox(ctx: CanvasRenderingContext2D, height: number) {
        // // Shadow properties
        // ctx.shadowOffsetX = 1; // Horizontal offset of the shadow
        // ctx.shadowOffsetY = 3; // Vertical offset of the shadow
        // ctx.shadowBlur = 4;    // Blur radius of the shadow
        // ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // Color of the shadow (semi-transparent black)
        this.boxShadow(ctx, 4);

        this.roundedRect(
            ctx,
            0,
            0,
            this.width(ctx),
            height,
            Theme.config.nodeBorderRadius,
        ); // Draws a square with rounded corners.
        ctx.fillStyle = Theme.config.nodeWinBgColor;
        ctx.fill();

        //ctx.shadowColor = 'transparent'; //Or, you can reset all shadow properties.
        this.boxShadow(ctx, 0);

        ctx.strokeStyle = this.selected
            ? Theme.config.selectionBoxColor
            : 'black';
        ctx.lineWidth = this.selected ? 1 : 0.5;
        ctx.stroke();
    }

    /**
     * Iterate over each outlet in this node (being IN or OUT sockets)
     * Optionally, if the `visitor` returns something, return whatever it returned on the first truthy return.
     */
    forEachOutlet<R>(visitor: (outlet: IOutlet, index: number) => R): R | void {
        //this._outlets.forEach(visitor);
        for (let i = 0; i < this._outlets.length; i++) {
            const outlet = this._outlets[i];
            const result = visitor(outlet, i);
            if (result !== null && result !== undefined) return result;
        }
    }

    /**
     * Return true if the global mouse position is over an outlet
     * @param globalX
     * @param globalY
     * @param onOutletHit call this callback if we are
     * @returns
     */
    getOutletUnderMouse(
        globalX: number,
        globalY: number,
        onOutletHit?: (outlet: IOutlet) => void,
    ) {
        const hitAreaRatio = 10;

        //
        // for each outlet of this node....
        //
        for (let i = 0; i < this._outlets.length; i++) {
            const outlet = this._outlets[i];

            //
            // if mouse is inside the hit area....
            //
            if (
                Math.abs(globalX - outlet.globalX) <= hitAreaRatio &&
                Math.abs(globalY - outlet.globalY) <= hitAreaRatio
            ) {
                console.log(
                    'OUTLET!!',
                    outlet.globalX,
                    globalX,
                    outlet.globalY,
                    globalY,
                );

                onOutletHit?.(outlet);
                return true;
            }
        }

        return false;
    }

    /**
     * Inform our output nodes that something has changed...
     * when overriding this you MUST call `super.update()` at the END so we can move onto the next connected node...
     */
    override update() {
        const next = new Set<Node>();

        //
        // update outlets so they show the right types
        //
        this.forEachOutlet((outlet) => {
            //
            // for each output...
            //
            if (!outlet.isInput) {
                //
                // since the node was "updated" now recalculate to see if the output is changed too...
                //
                outlet.updateType();

                if (isOutlet(outlet.connectedTo)) {
                    // remember the next connected node...
                    next.add(outlet.connectedTo.owner);
                }
            }
        });

        //
        // now call update on each output node we are connected to...
        //
        next.forEach((node) => node.update());
    }

    /**
     * Don't override... this method makes sure the script of thisi node is only created once by caching it.
     * It will throw an error if the script being passed is set to a scope that is out of reach by the scope that was originally used
     * to write our script, meaning, the script will never be able to reach whatever we had written in the script.
     */
    writeScript(script: Script): string {
        return script.getOrCacheNodeScript(this, () =>
            this.writeNodeScript(script),
        );
    }

    /**
     * Write out script to this script context object...
     * @returns the name of the variable that holds whatever we have generated so the output outlets can read data from us,.
     */
    protected writeNodeScript(_script: Script): string {
        throw new Error(`Implement me...`);
    }

    /**
     * Must return the type of data this node emits... meaning, if this node ends the `writeScript` with a `return script.writeScript` it should
     * specify what data type that reference will be expressed as.
     */
    get nodeDataType(): IDataType | undefined {
        //throw new Error(`Implement me...`);
        return;
    }

    /**
     * return an object that will be JSON serialized that represent the current state of this node.
     */
    serialize(): Record<string, any> {
        return {
            x: this.x,
            y: this.y,
            childOf: this.childOf?.nodeName,
            instanceOf: this.instanceOf?.nodeName,
        };
    }

    /**
     * Restore the state of the object from data previusly created from calling `serialize()`
     */
    unserialize(data: Record<string, any>) {
        this.x = data.x;
        this.y = data.y;

        this.childOf = data.childOf
            ? this.editor.getNodeByName(data.childOf)
            : undefined;
        this.instanceOf = data.instanceOf
            ? this.editor.getNodeByName(data.instanceOf)
            : undefined;
    }

    onAdded() {
        this.dispatchEvent({ type: 'added' });
    }
    onRemoved() {
        this.dispatchEvent({ type: 'removed' });
    }
}
