import { ComboBox } from './ComboBox';

export class DataTypeComboBox extends ComboBox {
    constructor(onChange?: (i: number) => void) {
        super('Type', ['float', 'vec2', 'vec3', 'vec4'], onChange);
    }
}
