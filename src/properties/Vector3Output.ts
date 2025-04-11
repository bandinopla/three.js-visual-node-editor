import { DataType } from '../core/IOutlet';
import { Output } from './Output';

export class Vector3Output extends Output {
    constructor(name: string) {
        super(name, DataType.vec3);
    }
}
