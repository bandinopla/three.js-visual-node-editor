import { LayoutElement } from '../layout/LayoutElement';

export class Space extends LayoutElement {
    constructor(private spaceSize = 10) {
        super();
    }

    override width(ctx: CanvasRenderingContext2D): number {
        return this.spaceSize;
    }
}
