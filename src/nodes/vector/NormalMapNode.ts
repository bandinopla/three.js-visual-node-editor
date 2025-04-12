import { Color } from 'three';
import { Theme } from '../../colors/Theme';
import { ComboBox } from '../../components/ComboBox';
import { ColorInputProperty } from '../../properties/ColorInputProperty';
import { InputOrValue } from '../../properties/InputOrValue';
import { WinNode } from '../WinNode';
import { Script } from '../../export/Script';
import { Output } from '../../properties/Output';
import { DataType } from '../../core/IOutlet';

export class NormalMapNode extends WinNode {
    protected typeCombo: ComboBox;
    protected strength: InputOrValue;
    protected color: ColorInputProperty;

    constructor() {
        const typeCombo = new ComboBox(
            'Space',
            ['Tangent Space', 'Object Space'],
            (v) => this.onTypeComboChange(v),
        );

        const strength = new InputOrValue({
            label: 'Strength',
            min: 0,
            max: 10,
            step: 0.1,
            asBar: true,
            defaultValue: 1,
        });

        const color = new ColorInputProperty(new Color(0xbcbcff));

        super('Normal Map', Theme.config.groupVector, [
            new Output('Normal', DataType.vec2),
            typeCombo,
            strength,
            color,
        ]);

        this.typeCombo = typeCombo;
        this.strength = strength;
        this.color = color;
    }

    protected onTypeComboChange(type: number) {
        this.update();
    }

    protected override writeNodeScript(script: Script): string {
        script.importModule('normalMap');

        let map = this.color.writeScript(script);
        let strength = this.strength.value;

        let node = `
const normalNode = normalMap( ${map}, ${strength});
        `;

        // i will leave this as a switch just in case...
        switch (this.typeCombo.index) {
            case 1:
                //object space
                node += `  
normalNode.normalMapType = THREE.ObjectSpaceNormalMap; 
`;
                break;
        }

        return script.define(
            this.nodeName,
            node + '\nreturn normalNode;',
            true,
        );
    }
}
