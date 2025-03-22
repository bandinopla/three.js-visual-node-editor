import { BaseNode } from "./nodes/BaseNode";
import { WinNode } from "./nodes/WinNode";

type MouseInfo = {
    clientX:number, clientY:number
}

type XY = {x:number, y:number }

export type Outlet = {
    isInput:boolean
    child: BaseNode,
    x:number,
    y:number,
    dir: {
        x:number,
        y:number
    }
}

type Connection = {
    from:Outlet
    to:Outlet|XY
}

export class Editor {
    private _ctx:CanvasRenderingContext2D;
    private mouseDrag = false;
    private focusedChild :WinNode|undefined;
    private mouse:XY = {x:0, y:0}
    private aspectCorrection = 1;

    protected objs:WinNode[] = [];
    readonly connections:Connection[] = [];

    constructor( readonly canvas:HTMLCanvasElement )
    {
        this._ctx = canvas.getContext('2d')!; //TODO:handle error

        const aspect = canvas.width / canvas.height;
        this.aspectCorrection = ( canvas.offsetWidth/canvas.offsetHeight )*aspect
        
        this.ctx.scale(1, this.aspectCorrection)

        //-------

        canvas.addEventListener("wheel", ev=>{

 
            const cursor = this.getMousePos( ev );
            const pos = this.getCanvasMousePosition( ev, cursor );
        
            this.ctx.translate( pos.x, pos.y ) 
         
            const scaleFactor =  (ev.deltaY>0?  .9 : 1.1); // Adjust this value to control the scaling speed 
         
            this.ctx.scale( scaleFactor, scaleFactor )
            this.ctx.translate( -pos.x, -pos.y )
        
        });

        canvas.addEventListener('mousemove', (event) => {
            let scale = this.ctx.getTransform().a; // Get the current scale (assuming uniform scaling)
            const mousePos = this.getMousePos( event); 
        
            const sx = mousePos.x - this.mouse.x;
            const sy = mousePos.y - this.mouse.y;
        
            if( this.mouseDrag )
            {
                this.ctx.translate( sx/scale, (sy/scale)/this.aspectCorrection )
            }
            else if( this.focusedChild )
            {
                this.focusedChild.x += sx/scale;
                this.focusedChild.y += (sy/scale)/this.aspectCorrection;
            }
            else 
            {
                const canvasPos = this.getCanvasMousePosition(event, mousePos);
                this.connections.filter(c=>!("child" in c.to)).forEach( c=>c.to=canvasPos); 
            }
        
            this.mouse = mousePos;
        });

        canvas.addEventListener("mousedown", ev=>{
            this.mouse = this.getMousePos( ev); 
        
            if( ev.button == 1 )
            { 
                this.mouseDrag = true;
            }
            else if( ev.button==0 )
            {
                const cursor = this.getCanvasMousePosition( ev, this.mouse );
                // see if someone wants to handle this event....  
        
                //find which obj...
                this.objs.forEach( obj=>{
        

                    if( obj.pressetOutlet( cursor.x-obj.x, cursor.y-obj.y, outlet =>{

                        //
                        // destroy any connectionusing this outlet...
                        //
                        this.destroyConnectionsUsing( outlet );

                        //
                        // create a connection
                        //
                        this.connections.push({
                            from: outlet,
                            to: cursor
                        })

                    } )) return;

                    if( cursor.x>obj.x && cursor.x<obj.x+obj.width && cursor.y>obj.y && cursor.y<obj.y+obj.height )
                    {    
                        // default... will make the object move...
                        this.focusedChild = obj; 
                    }
        
                });
            }
        });

        canvas.addEventListener("mouseup", ev=>{
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
                const cursor = this.getCanvasMousePosition( ev, this.mouse );
                this.objs.forEach( obj=>{

                    //
                    // create a connection between the current compatible outlets...
                    //
                    if( obj.pressetOutlet( cursor.x-obj.x, cursor.y-obj.y, outlet =>{  

                        this.destroyConnectionsUsing( outlet )
                        
                        //
                        // filer valid outlets
                        //
                        const outlets = this.connections.filter( c=>
                            !("child" in c.to) //must not have an ending
                            && c.from.isInput!=outlet.isInput //oposite kind (input->output)
                        );

                        outlets.forEach( c => {
                            c.to = outlet;
                        })
                       

                    } )) return;

                });



                //remove connections with no end...
                let clean = this.connections.filter( c=>"child" in c.to);
                this.connections.length=0;
                this.connections.push(...clean)
            }
        });
    }

    get ctx() {
        return this._ctx;
    }

    add( node:WinNode ) {
        node.editor = this;
        this.objs.push( node );
    }

    protected getMousePos( event:MouseInfo ):XY {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width; // account for CSS scaling
        const scaleY = this.canvas.height / rect.height; // account for CSS scaling
    
        let x = (event.clientX - rect.left) * scaleX;
        let y = (event.clientY - rect.top) * scaleY; 
    
        return { x: x, y: y };
    }

    protected getCanvasMousePosition( event:MouseInfo, cursor:XY ) :XY{
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

    protected destroyConnectionsUsing( outlet:Outlet )
    {
        const clean = this.connections.filter( c=>(c.from.child!=outlet.child || c.from.y!=outlet.y)
            && (!("child" in c.to) || ( c.to.child!=outlet.child || c.to.y!=outlet.y  ))
         );

        this.connections.length = 0;
        this.connections.push( ...clean );
    }

    start() {

        const ctx = this.ctx;

        ctx.save() 
        ctx.resetTransform()
        ctx.fillStyle = "#1d1d1d";
        ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
        ctx.restore()

        let connectioDirStrength = 50;

        //#region draw connections 
        this.connections.forEach( connection=>{

            ctx.beginPath();
            ctx.moveTo( connection.from.child.x + connection.from.x, connection.from.child.y + connection.from.y);

            const to = connection.to ;

            if( "child" in to )
            {
                ctx.bezierCurveTo(
                    (connection.from.child.x + connection.from.x) + connection.from.dir.x*connectioDirStrength, 
                    (connection.from.child.y + connection.from.y) + connection.from.dir.y*connectioDirStrength, 
    
                    (to.child.x + to.x) + to.dir.x*connectioDirStrength, 
                    (to.child.y + to.y) + to.dir.y*connectioDirStrength,  
    
                    to.child.x + to.x, 
                    to.child.y + to.y, 
                    );
            } 
            else 
            {
                ctx.bezierCurveTo(
                    (connection.from.child.x + connection.from.x) + connection.from.dir.x*connectioDirStrength, 
                    (connection.from.child.y + connection.from.y) + connection.from.dir.y*connectioDirStrength, 
    
                    to.x, 
                    to.y,  
    
                    to.x, 
                    to.y
                    );
            }
            

            ctx.strokeStyle = '#63c763';
            ctx.lineWidth = 3;
            ctx.stroke();

        })

        //#endregion

        this.objs.forEach( obj=>{ 

            ctx.save();

            obj.draw(ctx);

            ctx.restore();

        });

        requestAnimationFrame(()=>this.start());
    }
}