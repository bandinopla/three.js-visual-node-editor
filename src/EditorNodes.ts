import { Theme } from "./colors/Theme";
import { UVNode } from "./nodes/attribute/UVNode"; 
import { tslInputNodes } from "./nodes/input/TslInputNode";
import { ValueNode } from "./nodes/input/ValueNode";
import { FunctionNode } from "./nodes/logic/FunctionNode";
import { Node } from "./nodes/Node";
import { mathFunctions, mathOperations } from "./nodes/operators/list";
import {  methodsDefinitions2NodeClassDefinitions } from "./nodes/operators/MethodCallNode";
import { MeshStandardNode } from "./nodes/shader/MeshStandardNode";
import { ImageTextureNode } from "./nodes/texture/ImageTextureNode";
import { BumpMapNode } from "./nodes/vector/BumpMapNode";
import { NormalMapNode } from "./nodes/vector/NormalMapNode";

// Define the type for class constructors that extend BaseType
type Constructor<T extends Node> = new (...args: any[]) => T;
 
export type NodeGroupType = {
    group:string
    color:string
    exportsScript?:boolean,
    nodes:{ 
        TypeClass:Constructor<Node>, 
        name:string, 
        id:string,
        constructorArgs?: unknown
    }[]
}

export const NodeTypes : NodeGroupType[] = [
    {
        group:"Input",
        color:Theme.config.groupInput as string,
        nodes: [
            { TypeClass:ValueNode, name:"Value", id:"input-value"},
            { TypeClass:UVNode, name:"UV", id:"uv" },
            //{ TypeClass:PositionPropertiesNode, name:"Position", id:"position" },
            ...tslInputNodes
        ]
    }, 
    {
        group:"Logic",
        color:Theme.config.groupLogic as string,
        nodes: [
            {
                TypeClass:FunctionNode, name:"Function", id:"fn"
            }
        ]
    },
    {
        group:"Operators",
        color:Theme.config.groupMath as string, 
        nodes:[
            //{ TypeClass:MathNode, name:"Math", id:"math-operation"}
            ...methodsDefinitions2NodeClassDefinitions(mathOperations),
            ...methodsDefinitions2NodeClassDefinitions(mathFunctions, true),
        ]
    }, 
    {
        group:"Shader",
        color:Theme.config.groupShader as string,
        exportsScript: true,
        nodes:[
            { TypeClass:MeshStandardNode, name:"Mesh Standard Material", id:"mesh-standard-shader"}
        ]
    }, 
    {
        group:"Texture",
        color:Theme.config.groupTexture as string,
        nodes:[
            { TypeClass:ImageTextureNode, name:"Image Texture", id:"image-texture"}
        ]
    },
    {
        group:"Vector",
        color:Theme.config.groupVector as string,
        nodes: [
            { TypeClass:NormalMapNode, name: "Normal Map", id:"normal-map" },
            { TypeClass:BumpMapNode, name: "Bump Map", id:"bump-map" },
        ]
    }
]