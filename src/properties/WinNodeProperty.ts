import { LayoutElement } from "../layout/LayoutElement";
import { WinNode } from "../nodes/WinNode";

/**
 * Every property of a Win Node should extend this, so it was access to the `node` they are in...
 */
export class WinNodeProperty extends LayoutElement {
    get node() {
        return this.root as WinNode;
    }
}