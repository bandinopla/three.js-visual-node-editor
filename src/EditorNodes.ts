import { FillStyle, Theme } from "./colors/Theme";
import { UVNode } from "./nodes/attribute/UVNode";
import { MathNode } from "./nodes/operators/MathNode";
import { MeshStandardNode } from "./nodes/shader/MeshStandardNode";
import { ImageTextureNode } from "./nodes/texture/ImageTextureNode";
import { WinNode } from "./nodes/WinNode";

// Define the type for class constructors that extend BaseType
type Constructor<T extends WinNode> = new (...args: any[]) => T;
 
export type NodeGroupType = {
    group:string
    color:string
    exportsScript?:boolean,
    nodes:{ TypeClass:Constructor<WinNode>, name:string, id:string }[]
}

export const NodeTypes : NodeGroupType[] = [
    {
        group:"Attribute",
        color:Theme.config.groupAttribute as string,
        nodes:[
            { TypeClass:UVNode, name:"UV", id:"uv" }
        ]
    },
    {
        group:"Math",
        color:Theme.config.groupMath as string, 
        nodes:[
            { TypeClass:MathNode, name:"Operation", id:"math-operation"}
        ]
    }, 
    {
        group:"Shader",
        color:Theme.config.groupShader as string,
        exportsScript: true,
        nodes:[
            { TypeClass:MeshStandardNode, name:"Mesh Standard", id:"mesh-standard-shader"}
        ]
    }, 
    {
        group:"Texture",
        color:Theme.config.groupTexture as string,
        nodes:[
            { TypeClass:ImageTextureNode, name:"Image Texture", id:"image-texture"}
        ]
    }
]