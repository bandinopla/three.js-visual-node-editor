import * as TSL from 'three/tsl';
import * as THREE from 'three/webgpu'; 
import * as ADDONS from 'three/examples/jsm/Addons.js';

export type UniformType = "boolean" | "number" | "Color" | "Vector2" | "Vector3" | "Vector4" | "Matrix3" | "Matrix4";

/**
 * Handles the creation of the TSL output string
 */
export class Script { 

    private static nameIndex = 0;

    protected imports:Record<string, Set<string>>;  
    protected definitions:[ name:string, value:string][] ; 

    /**
     * array of [ index the definition in the definitions array, the variable type of the uniform ]
     */
    protected uniforms:[ name:string, type:UniformType, initialValue:string ][]=[];

    protected imagePaths:[ path:string, mime:string, previewImage?:string, textureSetup?:( refName:string)=>string ][] ; 
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
     * @param valueIsFunctionBody the contents of `varValue` will be put in the body of a self executing function.
     * @returns the name of the property passed.
     */
    define( varName:string, varValue:string|Object, valueIsFunctionBody = false ) {
        if( typeof varValue == "object" ) 
        {
            varValue = JSON.stringify(varValue);
            valueIsFunctionBody = false;
        }  
        else 
        {
            if( valueIsFunctionBody && !varValue.includes("return") )
            {
                throw new Error(`The value of script variable ${varName} MUST contain a return, since it is using valueIsFunctionBody=true`);
            }
        }

        if( !this.definitions.find(def=>def[0]==varName ))
             this.definitions.push( [ varName, String( valueIsFunctionBody? `(()=>{${varValue}})()` : varValue ) ] );
        return varName;
    }

    /**
     * Defines a uniform variable.
     * 
     * 
     * @see https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language#uniform
     * @param varName 
     * @param initialValue must ve a valid uniform value.
     * @returns the name of the variable holding the uniform.
     */
    defineUniform( varName:string, type:UniformType, initialValue:string ) {
         
        if( !this.uniforms.find( u=>u[0]==varName) )
        {
            this.uniforms.push( [ varName, type, initialValue ] );
        }

        return "$uniforms."+varName;
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
    loadTexture( imagePath?:string, mimeType?:string, previewImageSrc?:string, textureSetup?:( refName:string)=>string )
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

        if( mimeType?.includes("exr") )
        {
            this.importModule("EXRLoader","three/examples/jsm/Addons.js", ADDONS);
        }

        let index = this.imagePaths.findIndex( paths=>paths[1]==previewImageSrc );

        if( index<0 )
            index = this.imagePaths.push([ imagePath, mimeType!, previewImageSrc!, textureSetup ])-1;

        return `texture${ index }`; 
    }

    toString( lastExpression:string="", forExport = false ) {
 
        let output = `\n`;
        let exportKeyword = (forExport?"export":"");

        if( forExport )
        { 
            output += "import * as THREE from 'three/webgpu';\n";

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
        // uniforms
        //
        output += "\n" + exportKeyword + " const $uniforms = {\n" +
        this.uniforms.map( uniform => `${uniform[0]} : uniform( ${uniform[2]} )`).join(",")
        +"\n}\n";

        //
        // image loaders...
        //
        if( this.imagePaths.length )
        {
            //
            // utility function to load the texture...
            //
            output += `  
let onImageError = (url, err)=>console.error( "Failed to load: "+url,  err );

/**
 * If an image fails to load this will be called...
 * @param {(failedUrl:string, error:unknown)=>void customErrorHandler 
 * @returns 
 */
${exportKeyword} const setCustomImageErrorHanlder = ( customErrorHandler )=>onImageError=customErrorHandler;

let loadTexture = (url, mimeType, onLoaded) => {
    if (mimeType.includes("exr")) {
        const   exrLoader = new EXRLoader();
                
        return  exrLoader.load(url, onLoaded, undefined, onImageError.bind(null, url) );
    } else {
        const   textureLoader = new THREE.TextureLoader();
                
        return  textureLoader.load(url, onLoaded, undefined, onImageError.bind(null, url));
    }
};

/**
 * Given a image url (or the name of the image if it was loaded via "frile from disk") should return the corresponding texture
 * @param {(url:string, mimeType:string, onLoaded:(data: THREE.DataTexture, texData: object) => void)=>THREE.Texture} customLoader 
 * @returns 
 */
${exportKeyword} const setCustomImageLoader = ( customLoader )=>loadTexture=customLoader;
            `;

            //
            // for each used texture...
            //
            this.imagePaths.forEach( ([ path, mime, previewUrl, setupTexture ], index)=>{

                output += `
const texture${ index } = loadTexture('${ forExport? path : previewUrl }', '${mime}'${ setupTexture? `, texture => { ${setupTexture(`texture`)} }` :"" });`;

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

        fromModule(""); //Uff... i'll see how to improve this later.

        return eval( this.toString( returnThisRef, false ) );
    }

    public static makeValidVariableName(input:string) {
        // Return empty string if input is not a string or is empty
        if (typeof input !== 'string' || input.trim() === '') {
            return 'foo';
        }
    
        let str = input.trim();
    
        // Remove or replace invalid characters
        str = str.replace(/[^a-zA-Z0-9_$]/g, '_');
        
        // If starts with a number, prepend an underscore
        if (/^\d/.test(str)) {
            str = '_' + str;
        }
        
        // If empty after cleaning or starts with invalid character, use default name
        if (!str || !/^[a-zA-Z_$]/.test(str)) {
            return 'validVar';
        } 
        
        return "$"+str;
    }
}