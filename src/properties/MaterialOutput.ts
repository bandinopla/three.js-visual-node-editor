import { DataType } from '../core/IOutlet';
import { Output } from './Output';

export class MaterialOutput extends Output {
    constructor() {
        super('Material', DataType.material);
    }
}
