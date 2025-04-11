import { Output } from '../../properties/Output';
import { InputBaseNode } from './InputBaseNode';
import { ColorPicker } from '../../components/ColorPicker';
import { Script } from '../../export/Script';
import { DataType } from '../../core/IOutlet';
import { Color } from 'three';

export class ColorNode extends InputBaseNode {
    protected color: ColorPicker;

    constructor() {
        super('Color', [
            new ColorPicker(() => this.update(), true),
            new Output('color', DataType.wildcard),
        ]);

        this.color = this.getChildOfType(ColorPicker)!;
    }

    override get nodeDataType() {
        return DataType.vec3;
    }

    override width(ctx: CanvasRenderingContext2D): number {
        return super.width(ctx) / 2;
    }

    protected override writeNodeScript(script: Script): string {
        script.importModule('color');
        return script.define(
            'c_' + this.nodeName,
            `color(${this.color.color.getHex()})`,
        );
    }

    override serialize(): Record<string, any> {
        return {
            color: this.color.color.getHex(),
            ...super.serialize(),
        };
    }

    override unserialize(data: Record<string, any>): void {
        this.color.color = new Color(data.color);
        super.unserialize(data);
    }
}
