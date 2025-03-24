import { IOutlet } from "./IOutlet";

export function isOutlet( obj:any ): obj is IOutlet {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'isInput' in obj &&
        typeof obj.isInput === 'boolean' 
      );
}