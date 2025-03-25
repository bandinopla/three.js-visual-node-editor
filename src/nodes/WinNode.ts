import { FillStyle } from "../colors/Theme";
import { HeaderElement } from "../components/Header";
import { Layout } from "../layout/Layout";
import { LayoutElement } from "../layout/LayoutElement";
import { Node } from "./Node";

export class WinNode extends Node {
    constructor(protected title:string, groupColor:FillStyle, childs:LayoutElement[] )
    {
        super(new Layout( [
 
            new HeaderElement(title, groupColor),

            new Layout( childs, {
                direction:"column",
                gap: 5
            })
            
        ], {
            direction:"column"
        })); 
    }
}