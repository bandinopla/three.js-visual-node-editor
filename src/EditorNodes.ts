import { Theme } from './colors/Theme';
import { UVNode } from './nodes/attribute/UVNode';
import { ColorNode } from './nodes/input/ColorNode';
import { TimeNode } from './nodes/animation/TimeNode';
import { tslInputNodes } from './nodes/input/TslInputNode';
import { UniformValueNode } from './nodes/input/UniformValueNode';
import { ValueNode } from './nodes/input/ValueNode';
import { ForNode } from './nodes/logic/ForNode';
import { FunctionCallNode } from './nodes/logic/FunctionCallNode';
import { FunctionInputNode } from './nodes/logic/FunctionInputNode';
import { FunctionNode } from './nodes/logic/FunctionNode';
import { FunctionOutputNode } from './nodes/logic/FunctionOutputNode';
import { IfNode } from './nodes/logic/IfNode';
import { VariableDeclarationNode } from './nodes/logic/VariableDeclarationNode';
import { VariableValueAssignment } from './nodes/logic/VariableValueAssignment';
import { Node } from './nodes/Node';
import { mathFunctionNodes, mathOperatonNodes } from './nodes/operators/list';
import { SwizzleNode } from './nodes/operators/SwizzleNode';
import { MeshStandardNode } from './nodes/shader/MeshStandardNode';
import { ImageTextureNode } from './nodes/texture/ImageTextureNode';
import { BumpMapNode } from './nodes/vector/BumpMapNode';
import { NormalMapNode } from './nodes/vector/NormalMapNode';
import { AnimatedPixelNode } from './nodes/animation/AnimatedPixelNode';
import { SpliNode } from './nodes/operators/SplitNode';
import { HSVNode } from './nodes/input/HSVNode';

// Define the type for class constructors that extend BaseType
type Constructor<T extends Node> = new (...args: any[]) => T;

export type NodeGroupType = {
    group: string;
    color: string;
    exportsScript?: boolean;
    nodes: {
        TypeClass: Constructor<Node>;
        name: string;
        id: string;
        constructorArgs?: unknown;
        onCreated?: (instance: Node) => void;
        hidden?: boolean;
    }[];
};

export const NodeTypes: NodeGroupType[] = [
    {
        group: 'Input',
        color: Theme.config.groupInput as string,
        nodes: [
            {
                TypeClass: UniformValueNode,
                name: 'Uniform Value',
                id: 'uniform-value',
            },
            { TypeClass: ValueNode, name: 'Value', id: 'input-value' },
            { TypeClass: ColorNode, name: 'Color', id: 'color-value' },
            { TypeClass: HSVNode, name:"HSV", id:"hsv"},
            { TypeClass: UVNode, name: 'UV', id: 'uv' },
            //{ TypeClass:PositionPropertiesNode, name:"Position", id:"position" },
            ...tslInputNodes,
        ],
    },
    {
        group:'Animation',
        color: Theme.config.groupAnimation as string,
        nodes: [
            { TypeClass: TimeNode, name:"time", id:"timer" },
            { TypeClass: AnimatedPixelNode, name:"Animated Pixel", id:"timer" },
        ]
    },
    {
        group: 'Logic',
        color: Theme.config.groupLogic as string,
        nodes: [
            { TypeClass: FunctionNode, name: 'Function', id: 'fn' },
            {
                TypeClass: FunctionInputNode,
                name: 'Function Parameter',
                id: 'fn-param',
                hidden: true,
            },
            {
                TypeClass: FunctionOutputNode,
                name: 'Function Output',
                id: 'fn-output',
                hidden: true,
            },
            {
                TypeClass: FunctionCallNode,
                name: 'Function Call',
                id: 'fn-call',
                hidden: true,
            },
            { TypeClass: IfNode, name: 'If / Conditional', id: 'if' },
            { TypeClass:ForNode, name:"For loop", id:"foor-loop"},
            {
                TypeClass: VariableDeclarationNode,
                name: 'Variable declaration',
                id: 'var',
            },
            {
                TypeClass: VariableValueAssignment,
                name: 'Variable assignment',
                id: 'var-set',
            },
        ],
    },
    {
        group: 'Operators',
        color: Theme.config.groupMath as string,
        nodes: [
            ...mathOperatonNodes,
            ...mathFunctionNodes,
            {
                TypeClass: SwizzleNode,
                name: 'Swizzle',
                id: 'swizzle',
            },
            { TypeClass:SpliNode, name:"Split", id:"split"}
        ],
    },
    {
        group: 'Shader',
        color: Theme.config.groupShader as string,
        exportsScript: true,
        nodes: [
            {
                TypeClass: MeshStandardNode,
                name: 'Mesh Standard Material',
                id: 'mesh-standard-shader',
            },
        ],
    },
    {
        group: 'Texture',
        color: Theme.config.groupTexture as string,
        nodes: [
            {
                TypeClass: ImageTextureNode,
                name: 'Image Texture',
                id: 'image-texture',
            },
        ],
    },
    {
        group: 'Vector',
        color: Theme.config.groupVector as string,
        nodes: [
            { TypeClass: NormalMapNode, name: 'Normal Map', id: 'normal-map' },
            { TypeClass: BumpMapNode, name: 'Bump Map', id: 'bump-map' },
        ],
    },
];

export function getNodeTypeById(id: string) {
    return NodeTypes.flatMap((g) => g.nodes).find((n) => n.id == id);
}

export function newNodeById( id:string ) {
    const referencedNode = NodeTypes.flatMap((group) => group.nodes).find(
        (n) => n.id == id,
    );
    if (!referencedNode) {
        throw new Error(`Trying to create a node with id:${id} that doesn't exist.`);
    }

    const args = referencedNode.constructorArgs;

    if (args) {
        return new referencedNode.TypeClass(
            ...(Array.isArray(args)
                ? args
                : [args]),
        );
    } else {
        return new referencedNode.TypeClass();
    } 
}
