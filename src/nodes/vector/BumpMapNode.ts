import { Theme } from '../../colors/Theme';
import { Script } from '../../export/Script';
import { BasicInputProperty } from '../../properties/BasicInputProperty';
import { ComboBoxProperty } from '../../properties/ComboBoxProperty';
import { InputOrValue } from '../../properties/InputOrValue';
import { Output } from '../../properties/Output';
import { WinNode } from '../WinNode';
import { DataType } from '../../core/IOutlet';

export class BumpMapNode extends WinNode {
    protected invert: ComboBoxProperty;
    protected strength: InputOrValue;
    //protected distance:InputOrValue;
    protected bumpHeight: BasicInputProperty;
    protected normal: BasicInputProperty;

    constructor() {
        super('Bump Map', Theme.config.groupVector, [
            new Output('Normal', DataType.vec2),
            new ComboBoxProperty('Invert', [
                ['', '---'],
                ['.oneMinus()', 'Invert Height'],
            ]),

            new InputOrValue({
                label: 'Strength',
                min: 0,
                max: 10,
                asBar: true,
                step: 0.01,
                defaultValue: 1,
            }),
            //new InputOrValue(1, { label:"Distance", step:0.01, defaultValue:0.1 }),
            new BasicInputProperty(DataType.float, 'Height', () => 'float(0.1)'),
            new BasicInputProperty(DataType.vec2, 'Normal', () => ''),
        ]);

        this.invert = this.getChildOfType(ComboBoxProperty)!;
        this.strength = this.getChildOfType(InputOrValue)!;
        //this.distance = this.getChildOfType(InputOrValue, 1)!;
        this.bumpHeight = this.getChildOfType(BasicInputProperty, 0)!;
        this.normal = this.getChildOfType(BasicInputProperty, 1)!;
    }

    protected override writeNodeScript(script: Script): string {
        script.importModule('bumpMap');

        const bumpStrength = this.strength.writeScript(script);
        const bumpTexture =
            this.bumpHeight.writeScript(script) + this.invert.value;

        const output = `bumpMap( ${bumpTexture}, ${bumpStrength})`;

        const normal = this.normal.writeScript(script);

        /**
         * Taken from https://github.com/mrdoob/three.js/blob/dev/src/nodes/display/BumpMapNode.js
         * If anyone knows a cleaner way (not repeating/copy pasting code from the threejs source) let me know...
         */
        if (normal != '') {
            // Combine Normal map + bump map
            script.importModule([
                'uv',
                'float',
                'vec2',
                'faceDirection',
                'positionView',
                'Fn',
            ]);

            // Bump Mapping Unparametrized Surfaces on the GPU by Morten S. Mikkelsen
            // https://mmikk.github.io/papers3d/mm_sfgrad_bump.pdf
            const $dHdxy_fwd = script.define(
                'dHdxy_fwd',
                `Fn( ( { textureNode, bumpScale } ) => {

	// It's used to preserve the same TextureNode instance
	const sampleTexture = ( callback ) => textureNode.cache().context( { getUV: ( texNode ) => callback( texNode.uvNode || uv() ), forceUVContext: true } );

	const Hll = float( sampleTexture( ( uvNode ) => uvNode ) );

	return vec2(
		float( sampleTexture( ( uvNode ) => uvNode.add( uvNode.dFdx() ) ) ).sub( Hll ),
		float( sampleTexture( ( uvNode ) => uvNode.add( uvNode.dFdy() ) ) ).sub( Hll )
	).mul( bumpScale );

} );`,
            );

            const perturbNormalArb = script.define(
                'perturbNormalArb',
                `Fn( ( inputs ) => {

	const { surf_pos, surf_norm, dHdxy } = inputs;

	// normalize is done to ensure that the bump map looks the same regardless of the texture's scale
	const vSigmaX = surf_pos.dFdx().normalize();
	const vSigmaY = surf_pos.dFdy().normalize();
	const vN = surf_norm; // normalized

	const R1 = vSigmaY.cross( vN );
	const R2 = vN.cross( vSigmaX );

	const fDet = vSigmaX.dot( R1 ).mul( faceDirection );

	const vGrad = fDet.sign().mul( dHdxy.x.mul( R1 ).add( dHdxy.y.mul( R2 ) ) );

	return fDet.abs().mul( surf_norm ).sub( vGrad ).normalize();

} );`,
            );

            //--
            return script.define(
                this.nodeName,
                `
const dHdxy = ${$dHdxy_fwd}( { textureNode: ${bumpTexture}, bumpScale: ${bumpStrength} } );

return ${perturbNormalArb}( {
    surf_pos: positionView,
    surf_norm: ${normal},
    dHdxy
} );
 
`,
                true,
            );
            //--
        } else {
            return script.define(this.nodeName, output);
        }
    }

    override serialize(): Record<string, any> {
        return {
            ...super.serialize(),
            invert: this.invert.value,
            strength: this.strength.value, 
        }
    }

    override unserialize(data: Record<string, any>): void {
        super.unserialize(data);
        this.invert.value = data.invert;
        this.strength.value = data.strength;
    }
}
