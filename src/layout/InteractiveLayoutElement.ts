import { Vector2Like } from "three";
import { HitArea, IHandlesMouse } from "../events/IHandlesMouse";
import { LayoutElement } from "./LayoutElement";

export class InteractiveLayoutElement extends LayoutElement implements IHandlesMouse {


    readonly hitArea: HitArea = {
        x:0,
        y:0,
        w:0,
        h:0
    }

    onMouseWheel(deltaY: number): void { 
    }
    onMouseMove(deltaX: number, deltaY: number): void { 
    }
    onMouseDown(cursorX: number, cursorY: number): void { 
    }
    onMouseUp(): void { 
    } 

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

}