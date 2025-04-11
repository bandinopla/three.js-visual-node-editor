import { DataType } from '../core/IOutlet';
import { Output } from './Output';

export class UVAttributeProperty extends Output {
    constructor() {
        super('UV', DataType.vec2);
    }
}
