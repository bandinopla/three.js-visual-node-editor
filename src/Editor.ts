import { Vector2, Vector2Like } from "three";
import { IOutlet } from "./core/IOutlet";
import { IHandlesMouse } from "./events/IHandlesMouse"; 
import { Node } from "./nodes/Node"; 
import { ThreeScene } from "./ThreeScene";
import { isOutlet } from "./core/isOutlet";
import { Theme } from "./colors/Theme";
import { ImageAtlas } from "./util/ImageAtlas";
import { HandIcon } from "./components/HandIcon";
import { calculateDirectionAlignment } from "./util/isPointingAt";
import { isMouseHandler } from "./events/isMouseHandler";
import { IOverlayRenderer } from "./layout/IOverlayRenderer";
import { LayoutElement } from "./layout/LayoutElement";
import { onDoubleClick } from "./util/onDoubleClick";
import { createNewNode } from "./ui/NodeSelectionModal";
import { Connection, ConnectionsArray, OuletCandidate } from "./core/Connection";

type MouseInfo = {
    clientX:number, clientY:number
} 



/**
 * I'm the editor. I show the nodes, and run the ThreeJs background scene. 
 */
export class Editor {
    private _ctx:CanvasRenderingContext2D;
    private mouseDrag = false;
    private focusedChild :Node|undefined;
    private mouse:Vector2Like = {x:0, y:0}
    private aspectCorrection = 1; 

    private handIcon : HandIcon;

    protected objs:Node[] = [];
    protected zSortedObjs:Node[] = [];
    readonly connections:ConnectionsArray = new ConnectionsArray();

    /**
     * Available outlets to connect the current "open" connection to...
     */
    private availableOutlets:IOutlet[] = [];
    private selectedOutlet?:IOutlet;
    private chosenOutlet:OuletCandidate[] = [];

    readonly scene:ThreeScene;

    /**
     * An object that will intercept and handle the mouse events.
     */
    protected eventsHandler?:IHandlesMouse;

    /**
     * Set this to draw stuff AFTER everything else was drawn. This is the LAST draw call in the frame.
     */
    overlay?:IOverlayRenderer; 

    constructor( readonly canvas:HTMLCanvasElement )
    {
        this.handIcon = new HandIcon();
        

        this.scene = new ThreeScene();
        document.body.prepend( this.scene.renderer.domElement );

        this._ctx = canvas.getContext('2d')!; //TODO:handle error
        this._ctx.font = Theme.config.fontSize+'px '+Theme.config.fontFamily;

        const aspect = canvas.width / canvas.height;
        this.aspectCorrection = ( canvas.offsetWidth/canvas.offsetHeight )*aspect
        
        // fix aspect ratio...
        this.ctx.scale(1, this.aspectCorrection) ;

        // Double Click
        onDoubleClick(canvas, ev=>this.showNodeCreationMenu(ev));
        
        //#region MOUSE WHEEL
        const mouseWheelCaptured = (obj:LayoutElement, globalMouse:Vector2Like, delta:number) => obj.traverse( elem=>{

            if( isMouseHandler(elem) && elem.intersects(globalMouse) )
            {
                elem.onMouseWheel( delta );
                return true;
            }

        });

        canvas.addEventListener("wheel", ev=>{ 
 
            const cursor = this.getMousePos( ev );
            const pos = this.getCanvasMousePosition(cursor );

            if( this.overlay )
            { 
                if( mouseWheelCaptured(this.overlay.overlayBody, cursor, ev.deltaY) )
                    return;
            }

            if( this.eventsHandler )
            {
                this.eventsHandler.onMouseWheel( ev.deltaY )
                return;
            }

            //
            // check if some prop wants to handle the wheel...
            // 
            for (const obj of this.objs) { 
                if( mouseWheelCaptured(obj, cursor, ev.deltaY) )
                    return;
                // if( obj.traverse( elem=>{ 
                //     if( isMouseHandler(elem) && elem.intersects(cursor) )
                //     {
                //         elem.onMouseWheel( ev.deltaY );
                //         return true;
                //     }

                // })) 
                // return;
            } 

            //
            // default is to zoom in/out
            //
        
            this.ctx.translate( pos.x, pos.y ) 
         
            const scaleFactor =  (ev.deltaY>0?  .9 : 1.1); // Adjust this value to control the scaling speed 
         
            this.ctx.scale( scaleFactor, scaleFactor )
            this.ctx.translate( -pos.x, -pos.y )
        
        });
        //#endregion

        //#region MOUSE MOVE
        canvas.addEventListener('mousemove', (event) => {
            let scale = this.ctx.getTransform().a; // Get the current scale (assuming uniform scaling)
            const mousePos = this.getMousePos( event); 
            const canvasPos = this.getCanvasMousePosition(mousePos);

            let sx = ( mousePos.x - this.mouse.x )  ;
            let sy = ( mousePos.y - this.mouse.y ) ;

            this.mouse = mousePos;
            
            if( this.eventsHandler )
            {
                this.eventsHandler.onMouseMove( sx, sy );
                return;
            }

            sx /= scale;
            sy = sy / scale / this.aspectCorrection;
        
            if( this.mouseDrag )
            {
                this.ctx.translate( sx, sy)
            }
            else if( this.focusedChild )
            {
                this.focusedChild.x += sx;
                this.focusedChild.y += sy;
            }
            else 
            {
                //
                // update tail of "open" connections
                //
                ///this.connections.filter(c=>!( isOutlet(c.to) )).forEach( c=>c.to=mousePos);  
                this.connections.setOrphansTarget( mousePos );
            } 
            
        });
        //#endregion

        //#region MOUSE DOWN
        canvas.addEventListener("mousedown", ev=>{
            this.mouse = this.getMousePos( ev); 
        
            // middle mouse button to pan the workspace
            if( ev.button == 1 )
            { 
                this.mouseDrag = true;
            }

            // main mouse button to move stuff arround...
            else if( ev.button==0 )
            {
                const cursor = this.getCanvasMousePosition(this.mouse ); 


                if( this.overlay )
                {
                    if( this.clickElementAt( this.mouse, this.overlay.overlayBody ) )
                    { 
                        return;
                    } 
                    else 
                    {
                        //close overlay
                        this.overlay = undefined;
                    } 
                }

 
                // see if someone wants to handle this event....  
                const outlets:IOutlet[] = []; 
                const hitAreaRatio = 10;

                this.selectedOutlet = undefined;
                this.eventsHandler = undefined;
  
                //
                // let's see if some canvas element wants to capture the mouse....
                //
                for (const obj of this.zSortedObjs) {    
                    
                    //#region OUTLET
                    //
                    // check if mouse if over an outlet to create/delete a connection
                    //
                    obj.forEachOutlet( outlet => { 

                        if( Math.abs( this.mouse.x - outlet.globalX )<=hitAreaRatio && Math.abs( this.mouse.y - outlet.globalY )<=hitAreaRatio )
                        {
                            //
                            // destroy any connectionusing this outlet...
                            //
                            this.destroyConnectionsUsing( outlet );

                            //
                            // create a new "open" connection
                            //
                            this.connections.push({
                                from: outlet,
                                to: this.mouse
                            });
 
                            this.selectedOutlet = outlet;
                        }
                        else 
                        {
                            outlets.push( outlet );
                        } 

                    });

                    if( this.selectedOutlet ) continue;
                    //#endregion
  
                    //#region Click on element...
                    //
                    // check if a property wants to hook the event handling...
                    // 

                    if( this.clickElementAt( this.mouse, obj ) )
                    { 
                        return;
                    } 
 
                    //#endregion

                    //
                    // CURSOR IS INSIDE THE WINDOW NODE
                    // default: mouse down on the node window.
                    //
                    if( cursor.x>obj.x && cursor.x<obj.x+obj.width(this.ctx) && cursor.y>obj.y && cursor.y<obj.y+obj.height(this.ctx) )
                    {    
                        // default... will make the object move...
                        this.focusedChild = obj; 
                        this.bingToTop(obj);
                        break; //<-- to avoid processing childrens under us....
                    }
        
                };

                //
                // if we clicked an outlet, we need to know which of the available outlets are valid to be connected to...
                //
                if( this.selectedOutlet )
                { 
                    //
                    // filter only outlet that we can connect to...
                    //
                    this.availableOutlets = outlets.filter( outlet=>{
 
                        return (outlet.isInput!=this.selectedOutlet!.isInput ) 
                                //&& !outlet.connectedTo
                                && this.selectedOutlet!.isCompatible( outlet )
                                && ( outlet.owner !== this.selectedOutlet!.owner )
                                ; // TODO: check for outlet TYPE compatibility 
                    });
                } 

            }
        });
        //#endregion

        //#region MOUSE UP
        canvas.addEventListener("mouseup", ev=>{ 

            const cursor = this.getCanvasMousePosition( this.mouse );

            if( this.eventsHandler )
            {
                this.eventsHandler.onMouseUp();  
                this.eventsHandler = undefined;
                return;
            }

            if( ev.button == 1 )
            {
                this.mouseDrag = false;
            }
            else if( this.focusedChild )
            {
                this.focusedChild = undefined;
            }
            else 
            {

                // check if we are on top of an oulet...
                
                // this.objs.forEach( obj=>{

                //     //
                //     // create a connection between the current compatible outlets...
                //     //
                //     if( obj.pressetOutlet( cursor.x-obj.x, cursor.y-obj.y, outlet =>{  

                //         this.destroyConnectionsUsing( outlet )
                        
                //         //
                //         // filer valid outlets
                //         //
                //         const outlets = this.connections.filter( c=>
                //             !("child" in c.to) //must not have an ending
                //             && c.from.isInput!=outlet.isInput //oposite kind (input->output)
                //         );

                //         outlets.forEach( c => {
                //             c.to = outlet;
                //         })
                       

                //     } )) return;

                // }); 
                 
                if( this.chosenOutlet.length )
                { 
                    if( this.chosenOutlet.length>1 )
                        this.chosenOutlet.sort((a,b)=>b.alignmentScore-a.alignmentScore);


                    this.destroyConnectionsUsing( this.chosenOutlet[0].outlet );
 
                    this.connections.setOrphansTarget( this.chosenOutlet[0].outlet );

                    console.log("CONNECT",  this.chosenOutlet[0].outlet)
                    // this.connections.forEach( connection => { 

                    //     if( !("owner" in connection.to))
                    //     {
                    //         connection.to = this.chosenOutlet[0].outlet;
                    //     }

                    // }); 
                }

                this.chosenOutlet.length=0;
                this.availableOutlets.length=0;

                //remove connections with no end...
                this.connections.purge( c=>isOutlet(c.to) )
                // let clean = this.connections.filter( c=>"owner" in c.to);
                // this.connections.length=0;
                // this.connections.push(...clean)
            }
        });
        //#endregion
    } 

    get ctx() {
        return this._ctx;
    }

    protected bingToTop( node:Node ) {
        const nodeIndexZ = this.zSortedObjs.indexOf(node);
        const nodeIndex = this.objs.indexOf(node);
    
        if (nodeIndexZ !== -1) {
            this.zSortedObjs.splice(nodeIndexZ, 1);
            this.zSortedObjs.unshift(node);
        }
    
        if (nodeIndex !== -1) {
            this.objs.splice(nodeIndex, 1);
            this.objs.push(node);
        }
    }

    add( node:Node ) {
        node.editor = this;
        this.objs.push( node );
        this.zSortedObjs.unshift(node);
    }

    protected clickElementAt( globalPos:Vector2Like, root:LayoutElement )
    {
        return root.traverse( elem => { 
                        
            if( isMouseHandler(elem) && elem.intersects( globalPos ) )
            {    
                elem.onMouseDown( globalPos.x-elem.hitArea.x, globalPos.y-elem.hitArea.y);

                this.eventsHandler = elem;

                return elem; 
            }

        });
    }

    protected getMousePos( event:MouseInfo ):Vector2Like {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width; // account for CSS scaling
        const scaleY = this.canvas.height / rect.height; // account for CSS scaling
    
        let x = (event.clientX - rect.left) * scaleX;
        let y = (event.clientY - rect.top) * scaleY; 
    
        return { x: x, y: y };
    }

    protected getCanvasMousePosition( cursor:Vector2Like ) :Vector2Like{
        //last transform... 
    
        const transform = this.ctx.getTransform()
        const invTransform = transform.inverse();  
    
        const transformedX = invTransform.a * cursor.x + invTransform.c * cursor.y + invTransform.e;
        const transformedY = invTransform.b * cursor.x + invTransform.d * cursor.y + invTransform.f;
    
        return {
            x: transformedX,
            y: transformedY,
        }
    
    }

    protected destroyConnectionsUsing( outlet:IOutlet )
    {
        this.connections.purge( connection=>connection.from!==outlet && (!isOutlet(connection.to) || connection.to!==outlet) )
        // const clean = this.connections.filter( c=>( c.from!==outlet )
        //     && ( c.to !==outlet )
        // );

        // this.connections.length = 0;
        // this.connections.push( ...clean );
    }

    protected global2canvas( position:Vector2Like ) {
        const transform = this.ctx.getTransform() 
        const point = new DOMPoint(position.x, position.y);
        const screenPoint = transform.inverse().transformPoint(point);

        return screenPoint; 
    }

    /**
     * Draw the connection pipes
     * @param ctx 
     * @param theConnectedOnes which ones? the ones with both ends connected or the ones following the mouse?
     */
    protected drawConnectionPipes( ctx:CanvasRenderingContext2D, theConnectedOnes = true )
    {
        let connectioDirStrength = 50;  

        //#region draw connections 
        this.connections.forEach( connection=>{ 

            const from = this.global2canvas({x:connection.from.globalX, y:connection.from.globalY });
 
            let outDir = connection.from.isInput? -1 : 1;

            if( isOutlet(connection.to) )
            {
                if( !theConnectedOnes ) return; 

                ctx.beginPath();
                ctx.moveTo( from.x  , from.y );

                let to = this.global2canvas({x:connection.to.globalX, y:connection.to.globalY });

                ctx.bezierCurveTo(
                    from.x + outDir*connectioDirStrength, 
                    from.y , 
    
                    to.x + outDir*-connectioDirStrength, 
                    to.y ,  
    
                    to.x, 
                    to.y , 
                    );
                    
                if( connection.from.size!=connection.to.size )
                {
                    const gradient = ctx.createLinearGradient(
                        from.x, from.y,  
                        to.x, to.y
                    );
                        gradient.addColorStop(0, connection.from.color as string);
                        gradient.addColorStop(1, connection.to.color as string );
                        ctx.strokeStyle = gradient;
                }
                else 
                {
                    ctx.strokeStyle = connection.from.color;
                } 
                    
            } 
            else 
            { 
                if( theConnectedOnes ) return;

                ctx.beginPath();
                ctx.moveTo( from.x  , from.y );

                let to = this.global2canvas( connection.to );
 
                ctx.lineTo( 
                    to.x, 
                    to.y 
                    );

                ctx.setLineDash([5, 5]);
                ctx.strokeStyle = connection.from.color;
            }
            

            
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.setLineDash([]);

        })

        //#endregion
    }

    /**
     * Available connections will try to reach and make it easyer to connect to the user.
     * Original idea by: https://x.com/KennedyRichard/status/1823905562192449762
     */
    protected drawAvailableConnectionPipes( ctx:CanvasRenderingContext2D ) 
    {
        if(!this.selectedOutlet) return; 

        this.drawConnectionPipes( ctx, false )

        this.chosenOutlet.length = 0;

        const alignmentThreshold = 0.9;
        const maxReachDistance = 300;
        const distToPlug = 8;

        let cursor = this.global2canvas( this.mouse ); 
        let origin = this.global2canvas({ x:this.selectedOutlet.globalX, y:this.selectedOutlet.globalY });

        // direction from selected outlet to cursor.
        const dir = new Vector2(
            cursor.x - origin.x,
            cursor.y - origin.y
        ).normalize(); 


        ctx.strokeStyle = '#63c763';
        ctx.lineWidth = 3;
 
        
        const v:Vector2 = new Vector2(); 

        const options : { outlet:IOutlet, score:number, origin:Vector2Like, dir:Vector2Like, grab:boolean }[] = []
 

        //
        // now draw the connections cutting the distances in relation to their normal
        //
        this.availableOutlets.forEach( (outlet,i) =>{

            let position = this.global2canvas({ x:outlet.globalX, y:outlet.globalY });

            //
            // Direction to cursor...
            //
            v.set(
                cursor.x - position.x,
                cursor.y - position.y
            );
 
            const distanceToCursor = v.length();  

            //
            // if cursor is at reach....
            //
            if( distanceToCursor < maxReachDistance )
            {  

                // 3. Calculate the dot product
                const alignment = calculateDirectionAlignment(-dir.x, -dir.y, origin.x, origin.y, position.x, position.y);

                if( alignment<alignmentThreshold )
                {
                    return;
                } 

                const alignmentScore = ( alignment-alignmentThreshold ) / (1-alignmentThreshold) ;

                // not cut the length based on the distance...
                v.setLength( Math.min( distanceToCursor, (maxReachDistance-distanceToCursor) ) * alignmentScore );
 

                const outletGrabbed = v.clone().set(cursor.x - (position.x+v.x), cursor.y - (position.y+v.y)).length()<distToPlug;

                options.push({
                    outlet,
                    origin: position,
                    dir: v.clone(),
                    score: alignmentScore,
                    grab: outletGrabbed
                }); 
 
            } 
            

        });

        //
        // sort based on score : Higher score wins...
        //
        options.sort((a,b)=>b.score-a.score);

        //
        // only draw 1...
        // as suggested by : https://x.com/KennedyRichard/status/1904915424866681301
        // makes sense... to reduce visual noise. Just draw the most likely connection candidate.
        //
        if( options.length )
        {
            options.length=1;

            options.forEach( candidate => {

                ctx.beginPath();
                //ctx.setLineDash([5, 5]);
                ctx.moveTo( candidate.origin.x, candidate.origin.y );
                ctx.lineTo( candidate.origin.x + candidate.dir.x, candidate.origin.y + candidate.dir.y); 
                ctx.strokeStyle = candidate.outlet.color;
                ctx.stroke();
                //ctx.setLineDash([]);

                //
                // Draw the hand icon
                // 

                ctx.save(); 
                ctx.translate( candidate.origin.x + candidate.dir.x, candidate.origin.y + candidate.dir.y );
                ctx.rotate( Math.atan2(candidate.dir.y, candidate.dir.x)+Math.PI/2 );

                if( candidate.grab )
                {
                    this.chosenOutlet.push( { outlet:candidate.outlet, alignmentScore: candidate.score } );
                }

                this.handIcon.drawSprite(ctx, candidate.grab ?"grab" : "reach");
                ctx.restore(); 

            });
        }


        
    } 

    start() { 

        this.scene.render()

        const ctx = this.ctx;

        ctx.save() 
        ctx.resetTransform()
        ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
        //ctx.fillStyle = "#1d1d1d";  
        ctx.restore() 

        this.drawConnectionPipes(ctx); 

        this.objs.forEach( obj=>{ 

            ctx.save();

            obj.draw(ctx);

            ctx.restore();

        });

        this.drawAvailableConnectionPipes(ctx);

        ctx.save()
        this.overlay?.renderOverlay(ctx);
        ctx.restore() 

        requestAnimationFrame(()=>this.start());
    }

    protected showNodeCreationMenu( ev:MouseEvent ) {
        const at = this.getCanvasMousePosition(this.mouse ); ;

        createNewNode( ev.clientX, ev.clientY, newNode => {
 
            newNode.x = at.x;
            newNode.y = at.y;

            this.add( newNode );

        });
    }
}