import { Button } from "../../components/Button";
import { Script, UniformType } from "../../export/Script";
import { LayoutElement } from "../../layout/LayoutElement";
import { Output } from "../../properties/Output";
import { InputBaseNode } from "./InputBaseNode";



export class UniformBaseNode extends InputBaseNode {

    private static names:string[]=[];

    protected varName?:string;

    constructor( protected jsType:UniformType, childs:LayoutElement[]) {

        childs.unshift(new Output("Value", 1));

        childs.push( new Button("set name", ()=>this.setVariableName(), { fullWidth:true }))

        super("Uniform", childs);

        UniformBaseNode.names.push( this.uniformVarName );
        this.setTitle( this.uniformVarName );
    } 

    private get uniformVarName() {
        return this.varName ?? this.nodeName
    }

    private setVariableName( inputValue?:string ) {
        let newName = prompt("Set the name of the uniform (must ve a valid js variable name)", inputValue ?? this.uniformVarName );
        if( newName )
        {
            const currentIndex = UniformBaseNode.names.indexOf( this.uniformVarName );

            const cleanName = Script.makeValidVariableName(newName);

            //
            // check for collisions
            //
            if( UniformBaseNode.names.filter( (name, i)=>name==newName && i!=currentIndex).length>0 )
            {
                alert(`Name [${newName}] is taken, pick another...`);
                this.setVariableName( newName )
                return;
            }

            UniformBaseNode.names.splice( currentIndex, 1, cleanName );
            this.setTitle( cleanName.replace("$","$ ") );
            this.varName = cleanName;
        }
    }

    override writeScript(script: Script): string {
        script.importModule("uniform");

        return script.defineUniform( this.uniformVarName, this.jsType, this.getUniformJsValue() );
    }

    /**
     * A class that extends this one must override this value.
     * 
     * Should return the javascript string representing the value of this uniform... 
     * @see https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language#uniform
     */
    protected getUniformJsValue():string {
        throw new Error("implement me...")
    }

    override onRemoved(): void {
        super.onRemoved();
        UniformBaseNode.names.splice( UniformBaseNode.names.indexOf( this.uniformVarName ), 1);
    }
    
}