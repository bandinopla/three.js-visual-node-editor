import { FillStyle, Theme } from "../colors/Theme";
import { HeaderElement } from "../components/Header";
import { Layout } from "../layout/Layout";
import { LayoutElement } from "../layout/LayoutElement";
import { slugifyToFunctionName } from "../util/slugifyToFunctionName";
import { Node } from "./Node";

/**
 * Keep track of node name use so we can create unique names for each node.
 */
const nameCount :Record<string, number> = {};

export class WinNode extends Node {
    private _nodeName:string;
    protected header:HeaderElement;

    constructor(protected title:string, groupColor:FillStyle, protected childs:LayoutElement[] )
    {
        const header = new HeaderElement(title, groupColor);

        super(new Layout( [
 
            header, 
            new Layout( childs, {
                direction:"column",
                gap: 5,
                xPadding: Theme.config.nodeMargin
            })
            
        ], {
            direction:"column"
        }));  

        //#region crate a name for this node
        let name = slugifyToFunctionName(title);

        if( nameCount[name] )
        {
            // increment counter and append the trailing count to make the name unique...
            name += (++nameCount[name]).toString().padStart(3,"0");
        }
        else 
        {
            nameCount[name] = 1;
        }

        this._nodeName = name;
        this.header = header;
        //#endregion
    } 

    protected setTitle( newTitle:string ){
        this.header.title = newTitle;
    }

    protected getChildOfType<T>( constructor: new (...args: any[]) => T, pos=0 ): T | undefined {
        const matches = this.childs.filter((child) => Object.getPrototypeOf(child).constructor === constructor ) //child instanceof constructor);
        return matches[pos] as T | undefined;
    }
    
    override get nodeName(): string {
        return this._nodeName;
    }
}