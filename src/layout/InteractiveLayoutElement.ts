import { Vector2Like } from "three";
import { HitArea, IHandlesMouse } from "../events/IHandlesMouse";
import { LayoutElement } from "./LayoutElement";

 
/**
 * Elements that want to react to mouse events must extend this class and implements the desired hooks.
 */
export class InteractiveLayoutElement extends LayoutElement implements IHandlesMouse {

    private pressX:number = 0;
    private pressY:number = 0;

    /**
     * For mouse interaction
     */
    isLocked = false;

    readonly hitArea: HitArea = {
        x:0,
        y:0,
        w:0,
        h:0
    }

    onMouseWheel(deltaY: number): void { 
    }
    onMouseMove(deltaX: number, deltaY: number): void { 
        this.pressX += deltaX;
        this.pressY += deltaY;
        this.callCursorUV();
    }
    onMouseDown(cursorX: number, cursorY: number): void { 
        this.pressX = cursorX;
        this.pressY = cursorY;
        this.callCursorUV();
    }
    onMouseUp(): void { 
    } 

    private callCursorUV() {
        this.onCursorUV( this.pressX/this.hitArea.w, this.pressY/this.hitArea.h );
    }

    protected onCursorUV( u:number, v:number ) {}

    intersects(mouse: Vector2Like): boolean {
        return mouse.x>this.hitArea.x && mouse.x<this.hitArea.x+this.hitArea.w && 
               mouse.y>this.hitArea.y && mouse.y<this.hitArea.y+this.hitArea.h
    }

    protected defineHitArea( ctx: CanvasRenderingContext2D, localX:number, localY:number, width:number, height:number )
    {
        const A = this.getGlobalCoordinate(ctx, localX, localY );
        const B = this.getGlobalCoordinate(ctx, localX+width, localY+height );
        const hit = this.hitArea;

        hit.x = A.x;
        hit.y = A.y;
        hit.w = B.x-A.x;
        hit.h = B.y-A.y;
    }

    override render(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {
        this.defineHitArea(ctx, this.xPadding,0,maxWidth-this.xPadding*2,maxHeight); 
        super.render( ctx,maxWidth,maxHeight );
    }

}