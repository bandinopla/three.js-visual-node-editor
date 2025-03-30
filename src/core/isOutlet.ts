import { Node } from "../nodes/Node";
import { IOutlet, OutletSize } from "./IOutlet";

function isOutletSize(value: unknown): value is OutletSize {
    return typeof value === 'number' && [0, 1, 2, 3, 4, 5].includes(value);
}


// Type guard for IOutlet
export function isOutlet(obj: unknown): obj is IOutlet {
    return typeof obj === 'object' && obj !== null &&
    'isInput' in obj && typeof obj.isInput === 'boolean' && 
    'globalX' in obj && typeof obj.globalX === 'number' && 
    'globalY' in obj && typeof obj.globalY === 'number' &&  
    'owner' in obj && obj.owner instanceof Node &&
    'size' in obj && isOutletSize(obj.size) &&
    'color' in obj 
    && 'isCompatible' in obj && typeof obj.isCompatible == 'function'
}