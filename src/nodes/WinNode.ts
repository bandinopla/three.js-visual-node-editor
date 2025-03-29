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

    constructor(protected title:string, groupColor:FillStyle, protected childs:LayoutElement[] )
    {
        super(new Layout( [
 
            new HeaderElement(title, groupColor),

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
            name += (++nameCount[name]).toString().padEnd(4,"0");
        }
        else 
        {
            nameCount[name] = 1;
        }

        this._nodeName = name;
        //#endregion
    } 

    protected getChildOfType<T>(constructor: new (...args: any[]) => T): T | undefined {
        return this.childs.find((child) => child instanceof constructor) as T | undefined;
    }
    
    override get nodeName(): string {
        return this._nodeName;
    }
}