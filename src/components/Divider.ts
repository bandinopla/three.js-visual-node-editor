import { LayoutElement } from '../layout/LayoutElement';

export class Divider extends LayoutElement {
    constructor(protected label: string) {
        super();
    }

    override render(
        ctx: CanvasRenderingContext2D,
        maxWidth: number,
        maxHeight: number,
    ): void {
        const padding = 8;
        const middleY = maxHeight / 2;
        const middleX = maxWidth / 2;

        this.writeText(
            ctx,
            this.label,
            this.fontSize * 0.8,
            middleX,
            maxHeight,
            this.fontColor,
            'center',
        );

        const txtw = ctx.measureText(this.label).width;
        const htxtw = txtw / 2;

        ctx.lineWidth = 1;
        ctx.strokeStyle = this.fontColor;

        this.drawLine(ctx, 0, middleY, middleX - htxtw - padding, middleY);
        this.drawLine(
            ctx,
            middleX + htxtw + padding,
            middleY,
            maxWidth,
            middleY,
        );

        ctx.lineWidth = 0;
    }
}
