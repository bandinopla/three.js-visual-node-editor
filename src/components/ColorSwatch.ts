import { Color } from 'three';
import { LayoutElement } from '../layout/LayoutElement';
import { createCheckerPattern } from '../util/createCheckerPattern';

export class ColorSwatch extends LayoutElement {
    private _opacity = 1;
    private _color: Color = new Color();
    private checkerPattern = createCheckerPattern(5, 5, 'grey', 'lightgrey');

    set opacity(newOpacity: number) {
        this._opacity = newOpacity;
    }

    set color(newColor: Color) {
        this._color.copy(newColor);
    }

    protected override renderContents(
        ctx: CanvasRenderingContext2D,
        maxWidth: number,
        maxHeight: number,
    ): void {
        ctx.fillStyle = this._color.getStyle();
        ctx.fillRect(0, 0, maxWidth / 2, maxHeight);

        ctx.fillStyle = this.checkerPattern;
        ctx.fillRect(maxWidth / 2, 0, maxWidth / 2, maxHeight);

        ctx.fillStyle = this._color.getStyle();
        ctx.globalAlpha = this._opacity;
        ctx.fillRect(maxWidth / 2, 0, maxWidth / 2, maxHeight);
        ctx.globalAlpha = 1;
    }
}
