import { LayoutElement } from '../layout/LayoutElement';

let i = 0;

export class DebugElement extends LayoutElement {
    private colors = ['white', 'black', '#cccccc'];
    private color: string;

    constructor(
        private _width = 0,
        private _height = 0,
    ) {
        super();
        this.color = this.colors[++i % 3];
    }

    override width(ctx: CanvasRenderingContext2D): number {
        return this._width;
    }

    override height(ctx: CanvasRenderingContext2D): number {
        return this._height;
    }

    override render(
        ctx: CanvasRenderingContext2D,
        maxWidth: number,
        maxHeight: number,
    ): void {
        const w = this._width;
        const h = maxHeight;

        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, w, h);
    }
}
