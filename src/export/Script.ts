import * as TSL from 'three/tsl';
import * as THREE from 'three/webgpu';
import * as ADDONS from 'three/examples/jsm/Addons.js';
import { Node } from '../nodes/Node';

/**
 * When writing to the script, this object represents the "scope" in which the script is in... for example, defining a variable at the root
 * will declare the variable at a diferent place than if you are inside of an If statement. 
 */
type Scope = {
    parent?: Scope;
    definitions: [name: string, value: string][];
    exit: VoidFunction;
    toString(): string;
};

/**
 * When a node generates its scrirpt, in the same session, it will be cached so other nodes that also consume it will pull from that cache and the node
 * will only write it's script once.
 */
type NodeCache = {
    scope: Scope;
    output?: string;
    node: Node;
};

/**
 * Handles the creation of the TSL output string
 */
export class Script {
    private static nameIndex = 0;

    private cache: Map<Node, NodeCache> = new Map();
    protected imports: Record<string, Set<string>>;
    protected scopePath: Scope[];
    protected get currentScope() {
        return this.scopePath[this.scopePath.length - 1];
    }
    protected get rootScope() {
        return this.scopePath[0];
    }

    /**
     * array of [ index the definition in the definitions array, the variable type of the uniform ]
     */
    protected uniforms: [name: string, initialValue: string][] = [];

    protected imagePaths: [
        path: string,
        mime: string,
        previewImage?: string,
        textureSetup?: (refName: string) => string,
    ][];
    protected moduleName2Ref: Record<string, unknown>;

    constructor() {
        this.imports = {};
        this.imagePaths = [];

        this.scopePath = [];

        this.newScope();

        this.moduleName2Ref = {
            THREE,
        };
    }

    isCached(node: Node) {
        return this.cache.has(node);
    }

    /**
     * Cache the result of the node. And also remember info like the scope the node used to render, because users can connect nodes in random ways
     * and sometimes it can happen that a node is actually declared by one scope, but then another scope, totally unrelated, tries to access the node.
     * Think of the case of an if statement, where inside the if block you declare a variable, that only exists inside of the if block, but  in the graph editor
     * that block will look like nodes accessible from anywhere, the user could plug stuff into this node form outside the scope and that would be invalid...
     * it would visually look ok, but it should contextually be wrong...
     */
    getOrCacheNodeScript(node: Node, generateNodeScript: () => string) {
        let cached = this.cache.get(node);

        //
        // first time running the node...
        //
        if (!cached) {
            const nodeCahe: NodeCache = {
                node,
                scope: this.currentScope,
            };

            this.cache.set(node, nodeCahe);

            const output = generateNodeScript();

            nodeCahe.output = output;
            cached = nodeCahe;
        }

        //
        // it can happen if during the above initialization oft he cache, the write scrip pulls data from inputs that circle back to us...
        // in that case the output would still be undefined because if you look above we are assigning the value AFTER we set the cache,,, this was
        // intentional to get this error in case of the circular reference. If we got here and output is null it means it happened during the call to writeScript above.
        // most likely a circular reference indeed...
        //
        if (cached.output == undefined) {
            throw new Error(`Circular reference detected....`);
        }

        //
        // check scope... we must be able to reach the scope of the cached node following the parent.
        //
        let scope: Scope | undefined = this.currentScope;

        while (scope) {
            if (scope == cached.scope) {
                break;
            }

            scope = scope.parent;
        }

        if (!scope) {
            throw new Error(
                `Trying to reach a node that is out of reach by the current scope...`,
            );
        }

        return cached.output;
    }

    /**
     *
     * @param isChildScope If `true` it will share/use definitions with/from the parent scope.
     * @returns
     */
    newScope(isChildScope = false) {
        const index = this.scopePath.length;
        const current = this.currentScope;

        const scope: Scope = {
            parent: isChildScope ? current : undefined,
            definitions: [],
            exit: () => {
                if (index > 0) this.scopePath.pop();
            },
            toString: () => this.writeScopeDefinitions(scope),
        };

        this.scopePath.push(scope);

        return scope;
    }

    /**
     * Check to see if a variable name is defined in the current scope or looping up in the chain....
     * @param name
     * @param inThisScope
     * @returns
     */
    private isDefined(name: string, inThisScope?: Scope): boolean {
        const scope = inThisScope ?? this.currentScope;
        const definition = scope.definitions.find((def) => def[0] == name);

        if (!definition) {
            if (scope.parent) {
                return this.isDefined(name, scope.parent);
            }

            return false;
        }

        return true;
    }

    /**
     * Defines a variable or function... if it is not already set. Else, it will not override.
     * @param varName If empty string it will be the same as just writing the contents of `varValue` on a new line.
     * @param varValue a valid js sintax string or an object that will be stringified to a JSON
     * @param valueIsFunctionBody the contents of `varValue` will be put in the body of a self executing function.
     * @returns the name of the property passed.
     */
    define(
        varName: string,
        varValue: string | object,
        valueIsFunctionBody = false,
    ) {
        if (typeof varValue == 'object') {
            varValue = JSON.stringify(varValue);
            valueIsFunctionBody = false;
        } else {
            if (valueIsFunctionBody && !varValue.includes('return')) {
                throw new Error(
                    `The value of script variable ${varName} MUST contain a return, since it is using valueIsFunctionBody=true`,
                );
            }
        }

        //
        // variables are set in the current scope. But are searched all the way up in the scope hierarchy...
        //
        if (!this.isDefined(varName))
            this.currentScope.definitions.push([
                varName,
                String(
                    valueIsFunctionBody ? `(()=>{${varValue}})()` : varValue,
                ),
            ]);

        return varName;
    }

    writeLine(line: string) {
        this.currentScope.definitions.push(['', line]);
    }

    defineFunction(
        scope: Scope,
        functionName: string,
        useParams: boolean = false,
        returns: string = '',
    ) {
        functionName = 'fn_' + functionName;

        this.importModule("Fn");

        if (!this.isDefined(functionName, this.rootScope)) {
            this.rootScope.definitions.push([
                functionName,
                `Fn((${useParams ? 'params' : ''})=>{ 
            
                ${scope.toString()}

                ${returns != '' ? 'return ' + returns : ''}
                
            })`,
            ]);
        }

        return functionName;
    }

    protected writeScopeDefinitions(scope: Scope) {
        return scope.definitions
            .map(
                (definition) =>
                    (definition[0] != '' ? `\tconst ${definition[0]} = ` : '') +
                    definition[1],
            )
            .join(';\n');
    }

    /**
     * Defines a uniform variable. Uniforms are stored inside of an object to later be able to export it.
     *
     *
     * @see https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language#uniform
     * @param varName
     * @param initialValue must ve a valid uniform value.
     * @returns the name of the variable holding the uniform.
     */
    defineUniform(varName: string, initialValue: string) {
        this.importModule('uniform');

        if (!this.uniforms.find((u) => u[0] == varName)) {
            this.uniforms.push([varName, initialValue]);
        }

        return '$uniforms.' + varName;
    }

    /**
     * Module to import
     * @param dep
     * @param from import path of the module
     * @param module actual link to the module for doing previews in the editor
     */
    importModule(
        deps: string | string[],
        from = 'three/tsl',
        module: unknown = TSL,
    ) {
        const imports = (this.imports[from] ??= new Set());

        this.moduleName2Ref[from] = module;

        if (typeof deps === 'string') imports.add(deps);
        else deps.forEach((dep) => imports.add(dep));
    }

    /**
     * Tells that the script will need this texture loaded before even running...
     * @param imagePath
     */
    loadTexture(
        imagePath?: string,
        mimeType?: string,
        previewImageSrc?: string,
        textureSetup?: (refName: string) => string,
    ) {
        if (!imagePath) {
            this.define(
                'no_texture',
                `(() => {
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
})()`,
            );
            return 'no_texture';
        }

        if (mimeType?.includes('exr')) {
            this.importModule(
                'EXRLoader',
                'three/examples/jsm/Addons.js',
                ADDONS,
            );
        }

        let index = this.imagePaths.findIndex(
            (paths) => paths[1] == previewImageSrc,
        );

        if (index < 0)
            index =
                this.imagePaths.push([
                    imagePath,
                    mimeType!,
                    previewImageSrc!,
                    textureSetup,
                ]) - 1;

        return `texture${index}`;
    }

    toString(lastExpression: string = '', forExport = false) {
        let output = `\n`;
        const exportKeyword = forExport ? 'export' : '';

        if (forExport) {
            output += "import * as THREE from 'three/webgpu';\n";

            //
            // Imports...
            //
            for (const module in this.imports)
                output += `\nimport {${[...this.imports[module]].join(',')}} from '${module}';
                `;
        } else {
            output += `  const THREE = fromModule('THREE');
            `;
            //
            // since the script will be evaluated we will need to be injected by the evaluator...
            //
            for (const module in this.imports)
                output += `\n   const {${[...this.imports[module]].join(',')}} = fromModule('${module}');
                `;
        }

        //
        // uniforms
        //
        if (this.uniforms.length) {
            output +=
                '\n' +
                exportKeyword +
                ' const $uniforms = {\n' +
                this.uniforms
                    .map(
                        (uniform) => `${uniform[0]} : uniform( ${uniform[1]} )`,
                    )
                    .join(',') +
                '\n}\n';
        }

        //
        // image loaders...
        //
        if (this.imagePaths.length) {
            output += `
/**
 *  --- IMAGE LOADING: README!! ---
 *  You are responsable for loading the textures. You must import and call "setCustomImageLoader" that function will recieve
 *  the URL of the image it wants to load. You must return a THREE.Texture instance.
 */
            `;

            //
            // utility function to load the texture...
            //
            output += `  
let onImageError = (url, err)=>console.error( "Failed to load: "+url,  err );

/**
 * If an image fails to load this will be called...
 * @param {(failedUrl:string, error:unknown)=>void customErrorHandler}
 * @returns 
 */
${exportKeyword} const setCustomImageErrorHandler = ( customErrorHandler )=>onImageError=customErrorHandler;

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

/**
 *  These are the image textures used by your node setup...
 */ 
`;

            //
            // for each used texture...
            //
            this.imagePaths.forEach(
                ([path, mime, previewUrl, setupTexture], index) => {
                    output += `
const texture${index} = loadTexture('${forExport ? path : previewUrl}', '${mime}'${setupTexture ? `, texture => { ${setupTexture(`texture`)} }` : ''});
`;
                },
            );
        }

        //
        // Dependecies definitions
        //

        output += this.writeScopeDefinitions(this.rootScope);

        return output + `\n${lastExpression};`;
    }

    eval(returnThisRef: string) {
        const fromModule = (modulePath: string) =>
            this.moduleName2Ref[modulePath];

        fromModule(''); //Uff... i'll see how to improve this later.

        return eval(this.toString(returnThisRef, false));
    }

    public static makeValidVariableName(input: string) {
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

        return '$' + str;
    }
}
