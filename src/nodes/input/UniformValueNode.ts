import { ChangeNodeCustomNameButton } from '../../components/ChangeNodeCustomNameButton';
import { Script } from '../../export/Script';
import { ValueNode } from './ValueNode';

export class UniformValueNode extends ValueNode {
    readonly isUniform = true;

    constructor() {
        super(false);
        this.setTitle('Uniform');

        this.childs.push(
            new ChangeNodeCustomNameButton(
                (newName) =>
                    (this.customNodeName = this.editor.getSafeUniformName(
                        this,
                        newName,
                    )),
            ),
        );
    }

    override onAdded(): void {
        if (!this.customNodeName) {
            this.customNodeName = this.editor.getSafeUniformName(
                this,
                'uniform',
            );
        }
    }

    /**
     * This returns a THREE object to be used as value fo the uniform constructor.
     * https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language#uniform
     */
    protected getUniformValue(numbers: number[]): string {
        const len = numbers.length;
        if (len === 1) return `${numbers[0]}`;
        if (len >= 2 && len <= 4)
            return `THREE.Vector${len}(${numbers.join(', ')})`;
        throw new Error(
            'Invalid number of elements for uniform (only 1 to 4 numbers allowed)',
        );
    }

    protected override writeNodeScript(script: Script): string {
        const values = this.inputs
            .filter((input) => input.enabled)
            .map((input) => input.value);

        return script.defineUniform(
            this.nodeName,
            this.getUniformValue(values),
        );
    }
}
