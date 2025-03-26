 
import { Editor } from './Editor';  
import { UVNode } from './nodes/attribute/UVNode';
import { MeshStandardNode } from './nodes/shader/MeshStandardNode';
import { ImageTextureNode } from './nodes/texture/ImageTextureNode'; 
import './style.css' 

// Get the canvas and context
const canvas = document.getElementById('app') as HTMLCanvasElement;

const editor = new Editor(canvas); 

 
let win1 = new UVNode();
win1.x = 20;
win1.y = 20;
 

let win3 = new ImageTextureNode();
win3.x = 500;

editor.add( win1 ); 
editor.add( win3 );

let win4 = new MeshStandardNode();
win4.x =500;
win4.y = 200;
editor.add( win4 );

editor.start();
 
 
 