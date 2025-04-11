import { DataType } from '../core/IOutlet';
import { Script } from '../export/Script';
import { Input } from './Input';

export class UVTransformProperty extends Input {
    constructor() {
        super(DataType.vec2);
    }

    override renderContents(
        ctx: CanvasRenderingContext2D,
        maxWidth: number,
        maxHeight: number,
    ): void {
        this.writeText(ctx, 'UV', this.fontSize, 0, maxHeight, this.fontColor);
    }

    override writeScript(script: Script): string {
        script.importModule('uv');
        return !this.connectedTo ? 'uv()' : super.writeScript(script);
    }
}
