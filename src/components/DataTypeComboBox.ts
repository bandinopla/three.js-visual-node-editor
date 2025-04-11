import { ComboBox } from './ComboBox';

export class DataTypeComboBox extends ComboBox {
    constructor(onChange?: (i: number) => void) {
        super('Type', ['vec1', 'vec2', 'vec3', 'vec4'], onChange);
    }
}
