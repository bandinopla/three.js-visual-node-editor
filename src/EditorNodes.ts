import { FillStyle, Theme } from "./colors/Theme";
import { UVNode } from "./nodes/attribute/UVNode";
import { MeshStandardNode } from "./nodes/shader/MeshStandardNode";
import { ImageTextureNode } from "./nodes/texture/ImageTextureNode";
import { WinNode } from "./nodes/WinNode";

// Define the type for class constructors that extend BaseType
type Constructor<T extends WinNode> = new (...args: any[]) => T;
 
export type NodeGroupType = {
    group:string
    color:string
    nodes:{ TypeClass:Constructor<WinNode>, name:string }[]
}

export const NodeTypes : NodeGroupType[] = [
    {
        group:"Attribute",
        color:Theme.config.groupAttribute as string,
        nodes:[
            { TypeClass:UVNode, name:"UV" }
        ]
    },
    {
        group:"Shader",
        color:Theme.config.groupShader as string,
        nodes:[
            { TypeClass:MeshStandardNode, name:"Mesh Standard"}
        ]
    }, 
    {
        group:"Texture",
        color:Theme.config.groupTexture as string,
        nodes:[
            { TypeClass:ImageTextureNode, name:"Image Texture"}
        ]
    }
]