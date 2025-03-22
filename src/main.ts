import './style.css' 

// Get the canvas and context
const canvas = document.getElementById('app') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
let mouse = {x:0, y:0 }
let offset = {x:0, y:0 }
let pivot = {x:0, y:0 }
let scale = 1;
let matrix:DOMMatrix|undefined;
let mouseDrag = false;
let focusedChild :Child|undefined;
function getMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // account for CSS scaling
    const scaleY = canvas.height / rect.height; // account for CSS scaling

    let x = (event.clientX - rect.left) * scaleX;
    let y = (event.clientY - rect.top) * scaleY; 

    return { x: x, y: y };
}

function getCanvasMousePosition( event, cursor ) {
    //last transform...
 

    const transform = ctx.getTransform()
    const invTransform = transform.inverse(); 
 

    const transformedX = invTransform.a * cursor.x + invTransform.c * cursor.y + invTransform.e;
    const transformedY = invTransform.b * cursor.x + invTransform.d * cursor.y + invTransform.f;

    return {
        x: transformedX,
        y: transformedY,
    }

}

canvas.addEventListener("wheel", ev=>{

 
    const cursor = getMousePos(canvas, ev);
    const pos = getCanvasMousePosition( ev, cursor );

    ctx.translate( pos.x, pos.y ) 
 
    const scaleFactor =  (ev.deltaY>0?  .9 : 1.1); // Adjust this value to control the scaling speed 
 
    ctx.scale( scaleFactor, scaleFactor )
    ctx.translate( -pos.x, -pos.y )

})

canvas.addEventListener('mousemove', (event) => {
    let scale = ctx.getTransform().a; // Get the current scale (assuming uniform scaling)
    const mousePos = getMousePos(canvas, event); 

    const sx = mousePos.x - mouse.x;
    const sy = mousePos.y - mouse.y;

    if( mouseDrag )
        ctx.translate( sx/scale, sy/scale )

    if( focusedChild )
    {
        focusedChild.x += sx/scale;
        focusedChild.y += sy/scale;
    }

    mouse = mousePos;
});

canvas.addEventListener("mousedown", ev=>{
    mouse = getMousePos(canvas, ev);

    if( ev.button == 1 )
    { 
        mouseDrag = true;
    }
    else if( ev.button==0 )
    {
        const cursor = getCanvasMousePosition( canvas, mouse );

        //find which obj...
        objs.forEach( obj=>{

            if( cursor.x>obj.x && cursor.x<obj.x+obj.w && cursor.y>obj.y && cursor.y<obj.y+obj.h )
            { 
                focusedChild = obj;
            }

        });
    }
});
canvas.addEventListener("mouseup", ev=>{
    if( ev.button == 1 )
    {
        mouseDrag = false;
    }
    else if( focusedChild )
    {
        focusedChild = undefined;
    }
});


type Child = {
    x:number
    y:number
    color:number|string
    w:number 
    h:number
    origin?: {x:number, y:number }
    childs?:Child[],
    text?:string
    scale?:number
}

let objs : Child[] = [
    {
        origin: {x:0, y:0},
        x:0, 
        y:0,
        color:"#ff0000",
        w:50,
        h:50, 
        childs: [
            {
                x:25,
                y:25,
                w:25,
                h:25,
                color:"#0000ff", 
            },
            {
                x:10,
                y:10,
                w:10,
                h:10,
                color:"#00ff00", 
                text:"Hola mundo"
            }
        ]
    },

    {
        origin: {x:0, y:0},
        x:70, 
        y:70,
        color:"#ff0000",
        w:50,
        h:50,  
    }
]

type Outlet = {
    child: Child,
    x:number,
    y:number,
    dir: {
        x:number,
        y:number
    }
}

let connections : {
    from: Outlet,
    to: Outlet
}[] = [
    {
        from: {
            child:objs[0],
            x: 50,
            y: 25,
            dir: {
                x: 1,
                y: 0
            }
        },
        to: {
            child:objs[1],
            x: 0,
            y: 25,
            dir: {
               x: -1,
               y: 0 
            }
        }
    }
]

function drawObj( ctx:CanvasRenderingContext2D, obj:typeof objs[0], offsetX=0, offsetY=0 ) {

    ctx.save();
    ctx.translate( obj.x + offsetX, obj.y + offsetY ); 

    if( obj.scale )
    {
        ctx.scale( obj.scale, obj.scale )
    } 

    const ox = obj.origin?.x ?? 0;
    const oy = obj.origin?.y ?? 0;

    ctx.fillStyle = obj.color.toString();

    if( obj.text )
    {
        ctx.font = '8px Arial';
        ctx.fillText(obj.text, -ox,-oy);
    }
    else 
    {
        ctx.fillRect(-ox,-oy,obj.w, obj.h);
    }
    
    ctx.getTransform
    
    obj.childs?.forEach( child=>drawObj(ctx, child, -ox, -oy) )
    
    ctx.restore();
}

function draw() { 

    ctx.save() 
    ctx.resetTransform()
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.restore()
    //objs[0].rotation += 0.01
 
 
 
    objs.forEach( obj=>{ 
        
        drawObj(ctx, obj, 0, 0  ) 
    });

   
    // draw connetions....
    connections.forEach( connection=>{

        ctx.beginPath();
        ctx.moveTo( connection.from.child.x + connection.from.x, connection.from.child.y + connection.from.y);

        ctx.bezierCurveTo(
            (connection.from.child.x + connection.from.x) + connection.from.dir.x*10, 
            (connection.from.child.y + connection.from.y) + connection.from.dir.y*10, 

            (connection.to.child.x + connection.to.x) + connection.to.dir.x*10, 
            (connection.to.child.y + connection.to.y) + connection.to.dir.y*10,  

            connection.to.child.x + connection.to.x, 
            connection.to.child.y + connection.to.y, 
            );

        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();

    })
    
 
    //--------------
    requestAnimationFrame(draw);
}
 

draw();