import { Color, HSL } from 'three';
import { InteractiveLayoutElement } from '../layout/InteractiveLayoutElement';
import { Theme } from '../colors/Theme';

export class ColorWheel extends InteractiveLayoutElement {
    protected gradient?: CanvasGradient;
    protected brightness?: CanvasGradient;

    private colorPalette!: HTMLCanvasElement;
    private offscreenCanvas: HTMLCanvasElement;
    private offscreenContext: CanvasRenderingContext2D;
    private offscreenData: ImageData;
    private hslData: number[];

    private hsl: HSL = { h: 0, s: 0, l: 0 };
    private _color: Color = new Color();

    constructor(protected onColorScroll: (color: Color) => void) {
        super();
        this.singleLine = false;
        this.backgroundColor = 'black';

        //
        // create an offscreen canvas to paint the wheel in it
        //
        const W = 200;
        const H = 200;
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = W;
        this.offscreenCanvas.height = H;
        this.offscreenContext = this.offscreenCanvas.getContext('2d')!; //TODO: HANDLE ERROR
        this.offscreenData = this.offscreenContext.createImageData(W, H);
        this.hslData = new Array(W * H);
        this.colorPalette = this.offscreenCanvas;

        this.createColorPalette(0);
    }

    private createColorPalette(saturation: number) {
        const offscreenCtx = this.offscreenContext;
        const imageData = this.offscreenData;
        const data = imageData.data;

        // Store HSL values for each pixel to avoid repeated conversions
        const hslData = new Array(200 * 200);

        for (let y = 0; y < 200; y++) {
            for (let x = 0; x < 200; x++) {
                const hue = (x / 200) * 360;
                const lightness = 100 * (1 - y / 200);

                const index = y * 200 + x;
                hslData[index] = [hue / 360, saturation, lightness / 100];

                const rgb = this._color
                    .setHSL(hue / 360, saturation, lightness / 100)
                    .toArray();
                const pixelIndex = index * 4;
                data[pixelIndex] = rgb[0] * 255;
                data[pixelIndex + 1] = rgb[1] * 255;
                data[pixelIndex + 2] = rgb[2] * 255;
                data[pixelIndex + 3] = 255;
            }
        }

        offscreenCtx.putImageData(imageData, 0, 0);
    }

    override width(ctx: CanvasRenderingContext2D): number {
        return 100;
    }

    override height(ctx: CanvasRenderingContext2D): number {
        return 100;
    }

    protected override renderContents(
        ctx: CanvasRenderingContext2D,
        maxWidth: number,
        maxHeight: number,
    ): void {
        ctx.drawImage(
            this.colorPalette,
            0,
            0,
            200,
            200,
            0,
            0,
            maxWidth,
            maxHeight,
        );

        // mark...
        const w = 10;

        this.roundedRect(
            ctx,
            this.hsl.h * maxWidth - w / 2,
            (1 - this.hsl.l) * maxHeight - w / 2,
            w,
            w,
            15,
        );

        ctx.lineWidth = 3;
        ctx.strokeStyle = 'white';
        ctx.stroke();

        this.boxShadow(ctx, 5);
        ctx.fillStyle = `hsl(${this.hsl.h * 360}, ${this.hsl.s * 100}%, ${this.hsl.l * 100}%)`;

        ctx.fill();
    }

    set saturation(newSaturation: number) {
        if (newSaturation != this.hsl.s) {
            this.hsl.s = newSaturation;
            this.createColorPalette(newSaturation);
        }
    }

    set color(c: Color) {
        this._color = c;
        const saturation = this.hsl.s;
        c.getHSL(this.hsl);
        this.hsl.s = saturation;
    }

    protected override onCursorUV(u: number, v: number): void {
        const color = new Color();
        color.setHSL(u, this.hsl.s, 1 - v);
        this.onColorScroll?.(color);
    }
}
