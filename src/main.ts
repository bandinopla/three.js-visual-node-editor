//*/
import { Editor } from './Editor';   
import './style.css' 

// Get the canvas and context
const canvas = document.getElementById('app') as HTMLCanvasElement;

const editor = new Editor(canvas); 

editor.start();
/*/
import { test } from "./test.ts";

test();
//*/
 
 
 