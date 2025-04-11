import { ComboBoxProperty } from './ComboBoxProperty';

export class TextureColorSpaceProperty extends ComboBoxProperty {
    constructor() {
        super('Color Space', [
            ['THREE.SRGBColorSpace', 'sRGB'],
            ['THREE.LinearSRGBColorSpace', 'Non-Color'],
        ]);
    }
}
