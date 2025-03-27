import { NodeTypes } from "../EditorNodes";
import { WinNode } from "../nodes/WinNode";
import styles from "./NodeSelectionModal.module.css";

type NodeHandler = (node:WinNode)=>void

class NodeSelector {
    private div:HTMLDivElement;
    private input:HTMLInputElement;
    private _onCreated?:NodeHandler;

    constructor() { 
        this.div = document.createElement("div");
        this.div.classList.add( styles.root, styles.hide );
        document.body.appendChild( this.div );

        this.input = document.createElement("input");
        this.input.type= "text";
        this.input.placeholder="Find node by name...";

        this.div.appendChild( this.input );

        window.addEventListener("mousedown", ev=>{

            if( this.visible ) this.hide()

        });

        this.div.addEventListener("mousedown", ev=>{
            ev.stopImmediatePropagation()
        });

        //
        // Autocomplete
        //
        let autocompleteIntrv = 0; 
        this.input.addEventListener("keyup", ev=>{ 
            clearInterval(autocompleteIntrv);
            autocompleteIntrv = setTimeout(()=>this.filterList(),300);
        });

        // render types!
        //#region Node Types
        NodeTypes.forEach( groupType=>{

            const ul = document.createElement("ul");
            const groupDiv = this.div.appendChild( document.createElement("div") );
            const title = groupDiv.appendChild( document.createElement("div"));

            title.innerText = groupType.group;
            title.style.backgroundColor = groupType.color;
            title.classList.add( styles.groupTitle )

            groupType.nodes.forEach( node => {
 
                const li = ul.appendChild( document.createElement("li"));

                li.setAttribute("node-id", node.id);
                li.setAttribute("node-name", node.name);

                const groupLabel = li.appendChild( document.createElement("div") );
                const label = li.appendChild( document.createElement("span") );
                label.innerText = "→" + node.name;

                groupLabel.classList.add(styles.groupTitle)
                groupLabel.style.backgroundColor = groupType.color;
                groupLabel.innerText = groupType.group;

                li.addEventListener("click", ev=>this.addNewNode(new node.TypeClass))

            });

            groupDiv.classList.add( styles.group );
            groupDiv.appendChild(ul)

            

        });
        //#endregion
    }

    get visible() {
        return !this.div.classList.contains(styles.hide)
    }

    private filterList() {
        const term = this.input.value.toLowerCase();
        this.div.classList.remove( styles.term );
        if( term!=="" ) this.div.classList.add( styles.term );
        this.div.querySelectorAll("li").forEach( li => {
            const match = term=="" || li.getAttribute("node-name")?.toLowerCase().includes(term);
            li.classList.remove(styles.hide);
            if(!match){
                li.classList.add( styles.hide )
            }
        })
    }

    private addNewNode( node:WinNode )
    {
        this._onCreated?.(node);
        this.hide();
        
    }

    hide() {
        this.div.classList.add(styles.hide);
        this._onCreated = undefined;
    }

    show( posX:number, porY:number, onCreated:NodeHandler ) {
        this.div.classList.remove(styles.hide);
        this.div.style.left = `${posX-20}px`;
        this.div.style.top = `${porY-20}px`;

        this.input.value="";
        this.input.focus()
        this.filterList()

        this._onCreated = onCreated;
    }
}

let modal:NodeSelector;

export function createNewNode( showModalAtX:number, showModalAtY:number, onCreated:NodeHandler ) 
{
    if(!modal) modal = new NodeSelector();  

    modal.show(showModalAtX, showModalAtY, onCreated);
}