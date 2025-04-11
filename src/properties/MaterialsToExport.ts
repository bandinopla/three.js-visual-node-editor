import { TextLabel } from '../components/TextLabel';
import { DataType } from '../core/IOutlet';
import { Row } from '../layout/Layout';
import { Input } from './Input';

export class MaterialsToExport extends Input {
    constructor() {
        super(DataType.material);
        this.layout = new Row([new TextLabel('Materials used')]);
    }
}
