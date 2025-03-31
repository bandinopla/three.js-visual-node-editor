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
import { NodeTypes } from "./EditorNodes";
import { ScenePreviewNode } from "./nodes/preview/ScenePreview";
import { Script } from "./export/Script";

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
    private canvasAspect:number;

    /**
     * Used to be able to identify when a user just clicks ( a mouse up woth no mouse movement )
     */
    private mouseMoved = false;
    private handIcon : HandIcon;

    /**
     * The nodes
     */
    protected objs:Node[] = [];

    /**
     * objs in render order. Last = on top.
     */
    protected zSortedObjs:Node[] = [];

    /**
     * This holds the connections between nodes. Each object in this array represents a connection between 2 nodes.
     * If the connection is connected to a "Vec2Like" it means it is following the mouse and the user is about to create a new connection.
     */
    readonly connections:ConnectionsArray = new ConnectionsArray();

    /**
     * Available outlets to connect the current "open" connection to...
     */
    private availableOutlets:IOutlet[] = [];
    private selectedOutlet?:IOutlet;

    /**
     * Outlets that have potential to be a connection. Realistcally only the closest one to the cursor will...
     */
    private chosenOutlet:OuletCandidate[] = [];

    readonly scene:ThreeScene;

    /**
     * Start of a box selection. In canva's coordinate.
     */
    private boxSelectionStart?:Vector2Like;

    /**
     * Nodes selected...
     */
    private selectedNodes:Node[]=[]

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

        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;

        // Set CSS size (for display)
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;

        this.canvasAspect = this.canvas.height / this.canvas.width;
        this.reset();

        window.addEventListener("resize", this.onResize.bind(this)); 
        

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

            this.mouseMoved = true;

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
                //this.focusedChild.x += sx;
                //this.focusedChild.y += sy;

                // move the selection
                this.selectedNodes.forEach(node=>{
                    node.x += sx;
                    node.y += sy;
                })
            }
            else if( this.boxSelectionStart )
            {
                //
                // update box selection
                //
                this.selectNodesInsideBoxSelection(this.boxSelectionStart, canvasPos);
            }
            else 
            {
                //
                // update tail of "open" connections
                // 
                this.connections.setOrphansTarget( mousePos );
            } 
            
        });
        //#endregion

        //#region MOUSE DOWN
        canvas.addEventListener("mousedown", ev=>{

            this.mouseMoved = false;
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
                    this.clearBoxSelection();

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
                            // //
                            // // destroy any connectionusing this outlet...
                            // //
                            // this.destroyConnectionsUsing( outlet );

                            //
                            // create a new "open" connection
                            //
                            this.connections.push({
                                from: outlet,
                                to: this.mouse
                            });
 
                            this.selectedOutlet = outlet;
                            this.clearBoxSelection(); 
                        }
                        else 
                        {
                            outlets.push( outlet );
                        } 

                    });

                    if( this.selectedOutlet ) 
                        continue; //<------------------ we continue because we want to keep looping to collect all outlets.
                    
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

                    //@ts-ignore
                    if( this.selectedOutlet.isInput )
                    {
                        //
                        // in this case we will pretend that the connection was made by the other end of the connection if it was connected, to allow
                        // for the visual impression of changing the endpoint of the connection that lead to us.
                        //
                        const oldOutlet = this.selectedOutlet;

                        if( this.disolveSelectedOutlet() )
                        {
                            outlets.push( oldOutlet );
                            outlets.splice( outlets.indexOf( this.selectedOutlet ), 1 );
                        }
                    }

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

                //
                // if we selected a child...
                //
                else
                { 
                    if( this.focusedChild )
                    { 
                        if( !this.selectedNodes.includes(this.focusedChild) )
                        {
                            this.clearBoxSelection()
                            this.selectedNodes.push(this.focusedChild); 
                        }  

                        return;
                    }  
                    else 
                    {
                        this.clearBoxSelection();
                    }

                    this.boxSelectionStart = cursor;
                    
                    console.log("START SELECTION")
                }

            }
        });
        //#endregion

        //#region MOUSE UP
        canvas.addEventListener("mouseup", ev=>{ 

            const cursor = this.getCanvasMousePosition( this.mouse );

            this.boxSelectionStart = undefined;

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
                if( this.mouseMoved)
                    this.createChosenConnections(); 

                this.clearOutletSelection(); 
            }
        });
        //#endregion
    
        //#region KEYBOARD
        document.addEventListener('keydown', (event: KeyboardEvent) => { 
            const isSaveShortcut = (event.shiftKey) ;
            const key = event.key.toLowerCase();
            if( isSaveShortcut )
            {
                switch( key )
                {
                    case "s":
                        this.save();
                        break;

                    case "a":
                        this.open();
                        break;
                } 
            }
            else 
            {
                if( ["x","backspace","delete"].includes(key) )
                {
                    this.deleteSelected();
                }
            }
           
        });
        //#endregion
    } 

    reset() {
        this.aspectCorrection = ( this.canvas.offsetWidth/this.canvas.offsetHeight )*this.canvasAspect; 

        this.ctx.reset()
        this.ctx.scale(1, this.aspectCorrection) ; 

        this.clearBoxSelection()
        this.clearOutletSelection();

        this.eventsHandler = undefined;
        this.overlay = undefined;
        this.focusedChild = undefined;

        this.connections.reset();

        this.objs.length = 0;
        this.zSortedObjs.length = 0;

        //
        // add fixed nodes...
        //
        const previewNode = new ScenePreviewNode( this.scene );
        this.add( previewNode );

        previewNode.x = this.canvas.width/2 - previewNode.width( this.ctx )/2;
        previewNode.y = ( this.canvas.height/2/ this.aspectCorrection - previewNode.height( this.ctx )/2  ) ;

    } 

    protected onResize() { 
        const newAspectCorrection = ( this.canvas.offsetWidth/this.canvas.offsetHeight )*this.canvasAspect;

        const xChange = this.aspectCorrection/newAspectCorrection;

        this.aspectCorrection = newAspectCorrection;

        this.ctx.scale(xChange, 1) ; 
    }

    get ctx() {
        return this._ctx;
    }

    protected bingToTop( node:Node ) {
        const nodeIndexZ = this.zSortedObjs.indexOf(node);
        const nodeIndex = this.objs.indexOf(node);
    
        if (nodeIndexZ !== -1) {
            this.zSortedObjs.splice(nodeIndexZ, 1);
            this.zSortedObjs.push(node);
        }
    
        // if (nodeIndex !== -1) {
        //     this.objs.splice(nodeIndex, 1);
        //     this.objs.push(node);
        // }
    }

    add( node:Node|string ) {

        if( typeof node=="string" )
        {
            const referencedNode = NodeTypes.flatMap( group=>group.nodes ).find( n=>n.id==node );
            if(!referencedNode )
            {
                throw new Error(`Trying to create a node with id:${node} that doesn't exist.`);
            }
            node = new referencedNode.TypeClass();
        }

        node.editor = this;
        this.objs.push( node );
        this.zSortedObjs.unshift(node);

        return node;
    }

    remove( node:Node ){ 
        this.clearBoxSelection();
        this.clearOutletSelection();

        this.objs.splice( this.objs.indexOf(node), 1);
        this.zSortedObjs.splice( this.zSortedObjs.indexOf(node), 1);

        // delete connections if any
        this.connections.purge( connection=> {
            return connection.from.owner!==node && (!isOutlet(connection.to) || connection.to.owner!==node)
        });

        node.onRemoved();
    }

    deleteSelected() {

        const nodes2delete = this.selectedNodes.filter( node=>node.canBeDeleted );

        if( !nodes2delete.length ) return;
        if( !confirm("Delete currently selected nodes?")) return;

        this.clearOutletSelection();

        while( nodes2delete.length )
        {
            const node = nodes2delete.pop()!
            this.remove( node );
        }

        this.clearBoxSelection()

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

    protected destroyConnectionsUsing( outlet:IOutlet, onlyIfConnected=false )
    {
        this.connections.purge( connection=>(( connection.from!==outlet ) || ( onlyIfConnected && !isOutlet(connection.to) )) && ( !isOutlet(connection.to) || connection.to!==outlet) ) ;
    }

    /**
     * An input can only recieve 1 connection. The connection array will never have "to" repeated referencing the same outlet.
     */
    protected disolveSelectedOutlet() {
        if( !this.selectedOutlet || !this.selectedOutlet.isInput ) return false;

        const other = this.selectedOutlet.connectedTo;
        if( other )
        { 
            //
            // the first time we click an outlet a new connection if created with the "from" set to the clicked outlet and the "to" set to the mouse coordinates.
            //
            const openConnection = this.connections.find( c=>c.from==this.selectedOutlet && !isOutlet(c.to));

            let target :Vector2Like | undefined;

            if( openConnection )
            {
                target = openConnection.to as Vector2Like; //<--- mouse coordinates
            }

            this.destroyConnectionsUsing( this.selectedOutlet );

            this.selectedOutlet = other;

            if( target )
                this.connections.push({
                    from: other, 
                    to: target
                });

            return true;
        }

        return false;
    }

    /**
     * The user dragged the mouse out of an outlet aiming to create a new connection.
     */
    protected createChosenConnections() {

        if( !this.chosenOutlet.length || !this.selectedOutlet ) return;

        //
        // pick the best one for the current one...
        //
        if( this.chosenOutlet.length>1 )
            this.chosenOutlet.sort((a,b)=>b.alignmentScore-a.alignmentScore);


        const chosenTarget = this.chosenOutlet[0].outlet;

        if( this.selectedOutlet.isInput )
            this.destroyConnectionsUsing( this.selectedOutlet, true );

        //
        // all the connections that were following the mouse will not have this outlet as their endpoint connection.
        //
        this.connections.setOrphansTarget( chosenTarget );
    }

    protected clearOutletSelection() {

        this.selectedOutlet = undefined;
        this.availableOutlets.length = 0;
        this.chosenOutlet.length = 0; 

        //remove connections with no end...
        this.connections.purge( c=>isOutlet(c.to) );
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
        let dotPos:Vector2Like|undefined;

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

                dotPos = to; 
            }
            

            
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.setLineDash([]);

        });
        //#endregion

        if( dotPos && this.selectedOutlet )
        {
            ctx.beginPath();
            ctx.arc(dotPos.x, dotPos.y, 5, 0, 2 * Math.PI); // Create a circle path.
            ctx.fillStyle = this.selectedOutlet.color;
            ctx.fill(); // Fill the circle.
        }
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

    protected drawBoxSelection( ctx:CanvasRenderingContext2D ) {
        if(!this.boxSelectionStart) return;

        const cursor = this.getCanvasMousePosition(this.mouse );  

        ctx.save();
        ctx.beginPath()

        ctx.rect(this.boxSelectionStart.x,this.boxSelectionStart.y,
            cursor.x-this.boxSelectionStart.x,
            cursor.y-this.boxSelectionStart.y
        ); 
        
        ctx.lineWidth = 2
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = Theme.config.selectionBoxColor;
        ctx.stroke(); 
        ctx.restore()
    }

    protected clearBoxSelection() {
        this.selectedNodes.length=0; 
    }

    /**
     * Select the nodes inside the box...
     * @param poin1 In canva's coordinate
     * @param point2  In canva's coordinate
     */
    protected selectNodesInsideBoxSelection( point1:Vector2Like, point2:Vector2Like )
    {
        // reset
        this.selectedNodes.length = 0;

        const left = Math.min(point1.x, point2.x);
        const right = Math.max(point1.x, point2.x);
        const top = Math.min(point1.y, point2.y);
        const bottom = Math.max(point1.y, point2.y);
 
        const ctx = this._ctx;

        this.objs.forEach( node => {

            const objLeft = node.x;
            const objRight = node.x + node.width(ctx);
            const objTop = node.y;
            const objBottom = node.y + node.height(ctx);

            const overlaps =  (left <= objRight && 
                                right >= objLeft && 
                                top <= objBottom && 
                                bottom >= objTop);

            if( overlaps ) this.selectedNodes.push(node);
            
        });
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

        this.zSortedObjs.forEach( obj=>{ 

            ctx.save();

            obj.selected = this.selectedNodes.includes(obj)
            obj.draw(ctx);

            ctx.restore();

        });

        this.drawAvailableConnectionPipes(ctx); 
        this.drawBoxSelection(ctx);

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

    //#region SAVE / OPEN 
    /**
     * Save current layout as JSON embeded in a comment and export all the material nodes as javascript to be used as-is.
     */
    save() {
        const formatVersion = "0.0.1";
        const signature = `//
// ▗▄▄▄▖▗▖ ▗▖▗▄▄▖ ▗▄▄▄▖▗▄▄▄▖   ▗▖ ▗▄▄▖
//   █  ▐▌ ▐▌▐▌ ▐▌▐▌   ▐▌      ▐▌▐▌   
//   █  ▐▛▀▜▌▐▛▀▚▖▐▛▀▀▘▐▛▀▀▘   ▐▌ ▝▀▚▖
//   █  ▐▌ ▐▌▐▌ ▐▌▐▙▄▄▖▐▙▄▄▖▗▄▄▞▘▗▄▄▞▘
//   ThreeJs TSL Visual Node Editor v${formatVersion}
// 
`;
 
        const nodes = this.objs;
 
        const zOrder = this.zSortedObjs.map( node=>nodes.indexOf(node) )

        //
        // Serialize each node....
        //
        const layout = nodes.map( o=>({
            //
            // the node type id...
            //
            type: NodeTypes.flatMap(g=>g.nodes).find( n=> o instanceof n.TypeClass )?.id ?? "default", 

            //
            // node specific data
            //
            ...o.serialize()
        }) );

        //
        // Save the canva's transform...
        //
        const transform = this.ctx.getTransform(); 

        const canvasMatrix = {
            a: transform.a,    // horizontal scaling
            b: transform.b,    // vertical skewing
            c: transform.c,    // horizontal skewing
            d: transform.d,    // vertical scaling
            e: transform.e,    // horizontal translation
            f: transform.f     // vertical translation
        }; 

        //
        // Save the connections...
        // 
        this.clearOutletSelection();

        // [ FROMnodeIndex, FROMoutletIndex, TOnodeIndex, TOoutletIndex ]
        const connections = this.connections.map( con => [
            /* FROM NODE INDEX */ nodes.indexOf( con.from.owner ),  
            /* FROM OUTLET INDEX */con.from.owner.forEachOutlet( (outlet,i)=>outlet===con.from? i : null ), // coming out of this outlet...
            /* TO NODE INDEX */nodes.indexOf( (con.to as IOutlet).owner ), // to this node
            /* FROM OUTLET INDEX */(con.to as IOutlet).owner.forEachOutlet( (outlet,i)=>outlet===con.to? i : null ) // coming out of this outlet...
        ]);
        
        const payload = {
            layout, 
            zOrder,
            canvasMatrix,
            connections,
            format: formatVersion,
            date: new Date()
        }

        //
        // collect scripts...
        //
        const script = new Script();
        const materials :string[] = [];

        NodeTypes.filter( group=>group.exportsScript ).flatMap( group=>group.nodes ).forEach( node => {
            layout.forEach( (obj, index)=> {
                if( obj.type==node.id )
                {
                    materials.push( this.objs[ index ].writeScript(script) );
                }
            })
        });

        const js = materials.length? script.toString(`export const materials = [${ materials.map( m=>m+"()").join(",") } ];`,true) : "";
        

        //
        // Build the file...
        //
        const blob = new Blob([`${signature}/**LAYOUT** ${JSON.stringify(payload) } **LAYOUT**/ ${js}`], { type: 'application/javascript' });
        const url = window.URL.createObjectURL(blob);
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.download = "layout.js";
        
        // Programmatically click the link to trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        // save layout
        // export all materials
    }

    /**
     * Open a .js file previously saved vía de `save()` method.
     * Will reset the scene.
     */
    open() {
        // Create input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.js'; // Restrict to JS files

        input.onchange = (event: Event) => {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            
            if (!file) { 
                return;
            }

            const reader = new FileReader();
            
            reader.onload = () => {
                const content = reader.result as string; 
                const reg = /\*\*LAYOUT\*\*(.*)\*\*LAYOUT\*\*/m;
                const match = content.match( reg );
                if( match ) {
                    let data:any;

                    try 
                    {
                        data = JSON.parse( match[1].trim() ) ; 
                    }
                    catch( error ) {
                        console.error( error );
                        alert("Error parsing file...");
                        return;
                    }

                    this.restore( data );
                }
                else 
                {
                    alert("The selected file is not compatible or what not made by this app.")
                }
            };
            
            reader.onerror = () => alert('Error reading file') ;
            
            reader.readAsText(file);
        };

        // Trigger file selection
        input.click();
    }

    /**
     * Restore a previously saved data created by `save()`
     * @param data 
     */
    protected restore( data:any )
    { 
        // reset stage...
        this.reset();

        //
        // restore canvas matrix (position, zoom...)
        //
        const layoutMatrix = data.canvasMatrix as DOMMatrix;

        this.ctx.setTransform(
            layoutMatrix.a,
            layoutMatrix.b,
            layoutMatrix.c,
            layoutMatrix.d,
            layoutMatrix.e,
            layoutMatrix.f
        );

        //
        // recreate nodes
        //
        data.layout.forEach( ( nodeData:any, i:number ) => {

            const node = this.objs[i] ?? this.add( nodeData.type );

            node.unserialize( nodeData );

        });

        //
        // create connections
        //
        data.connections?.forEach( (connection:any) => {

            const [
                fromNodeIndex, 
                fromOutletIndex, 
                toNodeIndex, 
                toOutletIndex
            ] = connection;

            const fromNode = this.objs[ fromNodeIndex ];
                  fromNode.recalculateOutlets();

            const from = fromNode.forEachOutlet((outlet, i)=>i==fromOutletIndex? outlet : null);

            const toNode = this.objs[ toNodeIndex ];
                  toNode.recalculateOutlets();

            const to = toNode.forEachOutlet((outlet, i)=>i==toOutletIndex? outlet : null);
 

            if( isOutlet(from) && isOutlet(to) )
                this.connections.push({
                    from, to
                });

        });

    }

    //#endregion
}