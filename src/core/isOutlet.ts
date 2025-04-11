import { Node } from '../nodes/Node';
import { IOutlet, IDataType } from './IOutlet';

function isOutletType(value: unknown): value is IDataType {
    return typeof value === 'object' && value != null && 'size' in value;
}

// Type guard for IOutlet
export function isOutlet(obj: unknown): obj is IOutlet {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'isInput' in obj &&
        typeof obj.isInput === 'boolean' &&
        'globalX' in obj &&
        typeof obj.globalX === 'number' &&
        'globalY' in obj &&
        typeof obj.globalY === 'number' &&
        'owner' in obj &&
        obj.owner instanceof Node &&
        'type' in obj &&
        isOutletType(obj.type) &&
        'color' in obj &&
        'isCompatible' in obj &&
        typeof obj.isCompatible == 'function'
    );
}
