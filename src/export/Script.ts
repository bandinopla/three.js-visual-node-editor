import * as TSL from 'three/tsl';
import * as THREE from 'three/webgpu'; 

/**
 * Handles the creation of the TSL output string
 */
export class Script { 

    private static nameIndex = 0;

    protected imports:Record<string, Set<string>>;  
    protected definitions:[ name:string, value:string][] ; 
    protected imagePaths:[ path:string, previewImage?:string, textureSetup?:( refName:string)=>string ][] ; 
    protected moduleName2Ref:Record<string, unknown>; 

    constructor( ) { 
        this.imports = {};
        this.definitions = []; 
        this.imagePaths=[];
        this.moduleName2Ref = {
            THREE
        }
    } 

    /**
     * Defines a variable or function... if it is not already set. Else, it will not override.
     * @param varName 
     * @param varValue a valid js sintax string or an object that will be stringified to a JSON
     * @returns the name of the property passed.
     */
    define( varName:string, varValue:string|Object ) {
        if( typeof varValue == "object" ) 
        {
            varValue = JSON.stringify(varValue);
        } 

        if( !this.definitions.find(def=>def[0]==varName ))
             this.definitions.push( [ varName, String( varValue ) ] );
        return varName;
    }

    /**
     * Module to import
     * @param dep 
     * @param from import path of the module
     * @param module actual link to the module for doing previews in the editor
     */
    importModule( deps:string | string[], from="three/tsl", module:unknown = TSL ) {
        const imports = (this.imports[from] ??= new Set());

        this.moduleName2Ref[ from ] = module;

        if (typeof deps === 'string') imports.add(deps);
        else deps.forEach(dep=>imports.add(dep));
    } 

    /**
     * Tells that the script will need this texture loaded before even running...
     * @param imagePath 
     */
    loadTexture( imagePath?:string, previewImageSrc?:string, textureSetup?:( refName:string)=>string )
    {
        if( !imagePath )
        {
            this.define("no_texture", `(() => {
                const width = 1; // Texture width
                const height = 1; // Texture height
 
                const data = new Uint8Array(width * height * 4);
 
                data[0] = 0; // Red
                data[1] = 255;   // Green
                data[2] = 255;   // Blue
                data[3] = 255; // Alpha (fully opaque)
 
                const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
 
                texture.needsUpdate = true;

                return texture;
            })()`);
            return "no_texture";
        }

        let index = this.imagePaths.findIndex( paths=>paths[1]==previewImageSrc );

        if( index<0 )
            index = this.imagePaths.push([ imagePath, previewImageSrc!, textureSetup ])-1;

        return `textureLoader${ index }`; 
    }

    toString( lastExpression:string="", forExport = false ) {
 
        let output = ``;

        if( forExport )
        { 
            //
            // Imports...
            //
            for( const module in this.imports )  
                output += `\nimport {${ [...this.imports[module]].join(",") }} from '${module}';
                `; 
        }
        else 
        {
            //
            // since the script will be evaluated we will need to be injected by the evaluator...
            //
            for( const module in this.imports )  
                output += `\nconst {${ [...this.imports[module]].join(",") }} = fromModule('${module}');
                `; 
        }

        //
        // image loaders...
        //
        if( this.imagePaths.length )
        {
            //
            // utility function to load the texture...
            //
            output += `\nconst loadTexture = url => new THREE.TextureLoader().load(url);
            `;

            //
            // for each used texture...
            //
            this.imagePaths.forEach( ([ path, previewUrl, setupTexture ], index)=>{

                output += `\nconst textureLoader${ index } = loadTexture('${ forExport? path : previewUrl }');
                ${ setupTexture? setupTexture(`textureLoader${ index }`) :"" }
                `;

            });
        }
        

        //
        // Dependecies definitions
        //  
        this.definitions.forEach( ([name, value])=>{
            output += `\nconst ${name} = ${value};
            `;
        }); 

        return output + `\n${lastExpression};`;

    } 

    eval( returnThisRef:string )
    {
        const fromModule = ( modulePath:string ) => this.moduleName2Ref[ modulePath ]; 

        return eval( this.toString( returnThisRef, false ) );
    }
}