import { TextLabel } from '../components/TextLabel';
import { DataType } from '../core/IOutlet';
import { Row } from '../layout/Layout';
import { Input } from './Input';

export class MaterialProperty extends Input {
    constructor(readonly index: number) {
        super(DataType.material);

        this.layout = new Row([new TextLabel(`.material # ${index}  `)]);
        //this.xPadding = 10;
    }

    getMaterial() {
        // pull data from the input socket....
    }
}
