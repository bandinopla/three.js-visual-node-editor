import { LayoutElement } from './LayoutElement';

export class Stack extends LayoutElement {
    constructor(readonly childs: LayoutElement[]) {
        super();

        childs.forEach((child) => (child.parent = this));
    }

    override render(
        ctx: CanvasRenderingContext2D,
        maxWidth: number,
        maxHeight: number,
    ): void {
        this.childs.forEach((child) => child.render(ctx, maxWidth, maxHeight));
    }

    override traverse<T>(visitor: (elem: LayoutElement) => T): T | void {
        for (let i = 0; i < this.childs.length; i++) {
            const child = this.childs[i];
            const rtrn = child.traverse(visitor);
            if (rtrn) {
                return rtrn;
            }
        }
    }
}
