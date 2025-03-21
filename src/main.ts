import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg' 


// Get the canvas and context
const canvas = document.getElementById('app') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
let mouse = {x:0, y:0 }
let scale = 1;

function resizeCanvasToViewport() { 
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }
  
  // Initial resize and resize on window resize
  resizeCanvasToViewport();
  window.addEventListener('resize', resizeCanvasToViewport);



function getMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // account for CSS scaling
    const scaleY = canvas.height / rect.height; // account for CSS scaling

    let x = (event.clientX - rect.left) * scaleX;
    let y = (event.clientY - rect.top) * scaleY;

    // // Account for scroll
    // x += window.pageXOffset;
    // y += window.pageYOffset;

    return { x: x, y: y };
}

canvas.addEventListener("wheel", ev=>{
    //let scale = ctx.getTransform().a; // Get the current scale (assuming uniform scaling)
    const scaleFactor = 0.1; // Adjust this value to control the scaling speed

    if (ev.deltaY < 0) {
        // Scroll up (zoom in)
        scale += scaleFactor;
    } else {
        // Scroll down (zoom out)
        scale -= scaleFactor;
        if(scale < 0.1){ //prevent negative or very small scale.
            scale = 0.1;
        } 
    }  

})

canvas.addEventListener('mousemove', (event) => {
    let scale = ctx.getTransform().a; // Get the current scale (assuming uniform scaling)
    const mousePos = getMousePos(canvas, event);
    console.log('Mouse position in canvas space:', mousePos.x, mousePos.y);

    mouse.x = mousePos.x;
    mouse.y = mousePos.y;
    // // Example: Draw a circle at the mouse position
    // ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    // ctx.beginPath();
    // ctx.arc(mousePos.x*scale, mousePos.y*scale, 10, 0, 2 * Math.PI);
    // ctx.fillStyle = 'red';
    // ctx.fill();
});

type Child = {
    x:number
    y:number
    color:number|string
    w:number
    rotation:number
    h:number
    origin?: {x:number, y:number }
    childs?:Child[],
    text?:string
    scale?:number
}

let objs : Child[] = [
    {
        origin: {x:25, y:25},
        x:50, 
        y:50,
        color:"#ff0000",
        w:50,
        h:50,
        scale:10,
        rotation:Math.PI/4,
        childs: [
            {
                x:25,
                y:25,
                w:25,
                h:25,
                color:"#0000ff",
                rotation:0
            },
            {
                x:10,
                y:10,
                w:10,
                h:10,
                color:"#00ff00",
                rotation:0,
                text:"Hola mundo"
            }
        ]
    }
]

function drawObj( ctx:CanvasRenderingContext2D, obj:typeof objs[0], offsetX=0, offsetY=0 ) {

    ctx.save();
    ctx.translate( obj.x + offsetX, obj.y + offsetY ); 

    if( obj.scale )
    {
        ctx.scale( obj.scale, obj.scale )
    }
    ctx.rotate( obj.rotation );

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

    ctx.clearRect(0,0,canvas.width, canvas.height);

    objs[0].rotation += 0.01

    objs.forEach( obj=>{

        
        drawObj(ctx, obj, 500,500)
        
    });
    
    //--------------
    requestAnimationFrame(draw);
}

draw();