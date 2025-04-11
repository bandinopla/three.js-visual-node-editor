import { IOutlet, IDataType } from '../core/IOutlet';
import { OutletProperty } from './OutletProperty';

export class Input extends OutletProperty {
    constructor(type: IDataType) {
        super(true, type);
    }

    protected override onConnected(to: IOutlet): void {
        this.root.update();
        super.onConnected(to);
    }

    protected override onDisconnected(from: IOutlet): void {
        this.root.update();
    }
}
