import { DraggableValue } from './DraggableValue';

export class DraggableNumber extends DraggableValue {
    constructor(name: string = '', onChange?: (newValue: number) => void) {
        super(
            name,
            false,
            Number.MIN_SAFE_INTEGER,
            Number.MAX_SAFE_INTEGER,
            1,
            onChange,
        );
    }
}
