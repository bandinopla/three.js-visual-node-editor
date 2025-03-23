export interface IHandlesMouse {
    onMouseWheel( deltaY:number ):void;
    onMouseMove( deltaX:number, deltaY:number ):void;
    onMouseDown( cursorX:number, cursorY:number ):void;
    onMouseUp():void;
 
}