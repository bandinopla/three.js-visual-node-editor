import { refract } from "three/tsl";
import { Theme } from "../../colors/Theme";
import { DraggableNumber } from "../../components/DraggableNumber";
import { TextLabel } from "../../components/TextLabel";
import { Column } from "../../layout/Layout"; 
import { LayoutElement } from "../../layout/LayoutElement";
import { InputOrValue } from "../../properties/InputOrValue";
import { Output } from "../../properties/Output";
import { Node } from "../Node";
import { WinNode } from "../WinNode";
import { MethodCallDef } from "./list";
import { DraggableValue } from "../../components/DraggableValue";
import { Script } from "../../export/Script";

/**
 * Utility function to create the nodes defintions required by `EditorNodes`
 */
export function methodsDefinitions2NodeClassDefinitions( list:MethodCallDef[], listAreStandaloneFunctions = false ) {
    return list.map( methodDef => ({

                TypeClass:MethodCallNode, 
                name:methodDef.name, 
                id:methodDef.name,
                constructorArgs: {
                    ...methodDef,
                    isStandalone: listAreStandaloneFunctions
                }

    }) )
}

/**
 * A node that calls a method on it's main input and optionally uses secondary inputs as parameters.
 */
export class MethodCallNode extends WinNode {
    private A?:InputOrValue;
    private B?:InputOrValue;
    private C?:InputOrValue;

    constructor( protected config:MethodCallDef ) {
 
        const childs :InputOrValue[] = []; 

        if( config.params>0 ) childs.push( new InputOrValue(0,"", ()=>this.update()));
        if( config.params>1 ) childs.push( new InputOrValue(0,"", ()=>this.update()));
        if( config.params==3 ) childs.push( new InputOrValue(0,{
            asBar:true,
            min:0,
            max:1,
            step:0.01,
            label:"Fac"
        }, ()=>this.update())); 

        super(config.name, Theme.config.groupMath, [
            new Output("Result", 0) ,
            ...childs
        ]); 

        [this.A=undefined, this.B = undefined, this.C = undefined] = childs; 
    }

    override width(ctx: CanvasRenderingContext2D): number {
        return super.width(ctx) / ( this.config.params==3? 1 : 2)
    }

    override get nodeName(): string {
        return this.config.name+"_call";
    } 

    override writeScript(script: Script): string {

        const methodName = this.config.name;

        script.importModule( methodName );

        const a = this.A?.writeScript( script );
        const b = this.B?.writeScript( script );
        const c = this.C?.writeScript( script ); 

        let params = [a,b,c];

        if( !this.config.isStandalone ){
            params.shift();
        }

        params = params.filter( p=> p !== undefined && p !== null );

        return script.define( this.nodeName, (this.config.isStandalone? "" : `${a}.`) + `${methodName}( ${params})` );
    }
}