import { Editor } from './Editor'; 
import { DummyWin } from './nodes/DummyWin';
import { WinNode } from './nodes/WinNode';
import './style.css' 

// Get the canvas and context
const canvas = document.getElementById('app') as HTMLCanvasElement;

const editor = new Editor(canvas); 

 
let win1 = new DummyWin();
win1.x = 20;
win1.y = 20;

let win2 = new DummyWin();
win2.x = 100; 
win2.y = 100;

editor.add( win1 );
editor.add( win2 );

editor.start();
 

// let connections : {
//     from: Outlet,
//     to: Outlet
// }[] = [
//     {
//         from: {
//             child:objs[0],
//             x: 50,
//             y: 25,
//             dir: {
//                 x: 1,
//                 y: 0
//             }
//         },
//         to: {
//             child:objs[1],
//             x: 0,
//             y: 25,
//             dir: {
//                x: -1,
//                y: 0 
//             }
//         }
//     }
// ] 