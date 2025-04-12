import { Theme } from '../../colors/Theme';
import { ComboBox } from '../../components/ComboBox';
import { DataType, DataTypes, IDataType } from '../../core/IOutlet';
import { Script } from '../../export/Script';
import { Row } from '../../layout/Layout';
import { BasicInputProperty } from '../../properties/BasicInputProperty';
import { Output } from '../../properties/Output';
import { WinNode } from '../WinNode';

export class SwizzleNode extends WinNode {
    protected combos: ComponentCombibox[];
    protected source: BasicInputProperty;

    constructor() {
        const combos = [
            new ComponentCombibox('A', (i) => this.onCombo(0, i)),
            new ComponentCombibox('B', (i) => this.onCombo(1, i)),
            new ComponentCombibox('C', (i) => this.onCombo(2, i)),
            new ComponentCombibox('D', (i) => this.onCombo(3, i)),
        ];

        super('Swizzle', Theme.config.groupMath, [
            new BasicInputProperty(DataType.wildcard, 'source'),
            new Row(combos),
            new Output('result', DataType.wildcard),
        ]);

        this.source = this.getChildOfType(BasicInputProperty)!;
        this.combos = combos;
    }

    private onCombo(index: number, value: number) {
      
        this.combos.forEach((combo, i) => {
            if (i <= index) return;
            if (value == 0) {
                combo.index = 0;
            }
        });

        this.update();
    }

    override get nodeDataType(): IDataType | undefined {
        // same type as source but with the size of the active combos

        const type: IDataType = this.source.connectedTo
            ? this.source.connectedTo.type
            : DataType.float;
        const size = this.combos.reduce(
            (t, combo) => t + (combo.index > 0 ? 1 : 0),
            0,
        );

        return DataTypes.find((dt) => {
            const t = dt.type;
            return (
                t.bool == type.bool &&
                t.int == type.int &&
                !t.matrix &&
                t.unsigned == type.unsigned &&
                t.size == size
            );
        })!.type;
    }

    override update(): void {
        const size = this.source.connectedTo?.type.size ?? 4;

        this.combos.forEach((combo, i) => {
            combo.enabled = i + 1 <= size;
        });

        super.update();
    }

    protected override writeNodeScript(script: Script): string {
        const input = this.source.writeScript(script);
        return script.define(
            this.nodeName,
            input +
                '.' +
                this.combos
                    .filter((c) => c.index > 0)
                    .map((c) => c.selectedOption)
                    .join('')
                    .toLowerCase(),
        );
    }

    override serialize(): Record<string, any> {
        return {
            components: this.combos.map((combo) => combo.index),
            ...super.serialize(),
        };
    }

    override unserialize(data: Record<string, any>): void {
        super.unserialize(data);
        this.combos.forEach((combo, i) => {
            combo.index = data.components[i] ?? 0;
        });

        
    }
}

class ComponentCombibox extends ComboBox {
    constructor(title: string, onChange?: (i: number) => void) {
        super(title, ['---', 'X', 'Y', 'Z', 'W'], onChange);
    }
}
