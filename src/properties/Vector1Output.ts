import { DataType } from '../core/IOutlet';
import { Output } from './Output';

export class Vector1Output extends Output {
    constructor(name: string) {
        super(name, DataType.float);
    }
}
