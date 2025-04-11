import { IHandlesMouse } from './IHandlesMouse';

export function isMouseHandler(obj: any): obj is IHandlesMouse {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'onMouseWheel' in obj &&
        typeof obj.onMouseWheel === 'function' &&
        'onMouseMove' in obj &&
        typeof obj.onMouseMove === 'function' &&
        'onMouseDown' in obj &&
        typeof obj.onMouseDown === 'function' &&
        'onMouseUp' in obj &&
        typeof obj.onMouseUp === 'function' &&
        'intersects' in obj &&
        typeof obj.intersects === 'function' &&
        'hitArea' in obj &&
        typeof obj.hitArea === 'object' &&
        typeof obj.hitArea.x === 'number' &&
        typeof obj.hitArea.y === 'number' &&
        typeof obj.hitArea.h === 'number' &&
        typeof obj.hitArea.w === 'number'
    );
}
