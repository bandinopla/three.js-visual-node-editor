import { Vector2Like } from "three";

export interface HitArea {
    x:number
    y:number
    w:number
    h:number
}
export interface IHandlesMouse {
    onMouseWheel( deltaY:number ):void;
    onMouseMove( deltaX:number, deltaY:number ):void;
    onMouseDown( cursorX:number, cursorY:number ):void;
    onMouseUp():void;
 
    hitArea: HitArea 

    intersects( mouse:Vector2Like ):boolean

    isLocked?:boolean
}