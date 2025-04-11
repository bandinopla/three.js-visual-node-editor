import { string } from 'three/tsl';
import { PropertiesNode } from './PropertiesNode';

const tslInputs: [string, any][] = [
    [
        'Bitangent',
        [
            {
                name: 'bitangentGeometry',
                desc: 'Normalized bitangent in geometry space.',
                type: 'vec3',
            },
            {
                name: 'bitangentLocal',
                desc: 'Normalized bitangent in local space.',
                type: 'vec3',
            },
            {
                name: 'bitangentView',
                desc: 'Normalized bitangent in view space.',
                type: 'vec3',
            },
            {
                name: 'bitangentWorld',
                desc: 'Normalized bitangent in world space.',
                type: 'vec3',
            },
            {
                name: 'transformedBitangentView',
                desc: 'Normalized transformed bitangent in view space.',
                type: 'vec3',
            },
            {
                name: 'transformedBitangentWorld',
                desc: 'Normalized transformed bitangent in world space.',
                type: 'vec3',
            },
        ],
    ],

    [
        'Camera',
        [
            {
                name: 'cameraNear',
                desc: 'Near plane distance of the camera.',
                type: 'float',
            },
            {
                name: 'cameraFar',
                desc: 'Far plane distance of the camera.',
                type: 'float',
            },
            {
                name: 'cameraProjectionMatrix',
                desc: 'Projection matrix of the camera.',
                type: 'mat4',
            },
            {
                name: 'cameraProjectionMatrixInverse',
                desc: 'Inverse projection matrix of the camera.',
                type: 'mat4',
            },
            {
                name: 'cameraViewMatrix',
                desc: 'View matrix of the camera.',
                type: 'mat4',
            },
            {
                name: 'cameraWorldMatrix',
                desc: 'World matrix of the camera.',
                type: 'mat4',
            },
            {
                name: 'cameraNormalMatrix',
                desc: 'Normal matrix of the camera.',
                type: 'mat3',
            },
            {
                name: 'cameraPosition',
                desc: 'World position of the camera.',
                type: 'vec3',
            },
        ],
    ],

    [
        'Model',
        [
            {
                name: 'modelDirection',
                desc: 'Direction of the model.',
                type: 'vec3',
            },
            {
                name: 'modelViewMatrix',
                desc: 'View-space matrix of the model.',
                type: 'mat4',
            },
            {
                name: 'modelNormalMatrix',
                desc: 'View-space matrix of the model.',
                type: 'mat3',
            },
            {
                name: 'modelWorldMatrix',
                desc: 'World-space matrix of the model.',
                type: 'mat4',
            },
            {
                name: 'modelPosition',
                desc: 'Position of the model.',
                type: 'vec3',
            },
            { name: 'modelScale', desc: 'Scale of the model.', type: 'vec3' },
            {
                name: 'modelViewPosition',
                desc: 'View-space position of the model.',
                type: 'vec3',
            },
            {
                name: 'modelWorldMatrixInverse',
                desc: 'Inverse world matrix of the model.',
                type: 'mat4',
            },
            {
                name: 'highpModelViewMatrix',
                desc: 'View-space matrix of the model computed on CPU using 64-bit.',
                type: 'mat4',
            },
            {
                name: 'highpModelNormalViewMatrix',
                desc: 'View-space normal matrix of the model computed on CPU using 64-bit.',
                type: 'mat3',
            },
        ],
    ],

    [
        'Normal',
        [
            {
                name: 'normalGeometry',
                desc: 'Normal attribute of geometry.',
                type: 'vec3',
            },
            {
                name: 'normalLocal',
                desc: 'Local variable for normal.',
                type: 'vec3',
            },
            {
                name: 'normalView',
                desc: 'Normalized view normal.',
                type: 'vec3',
            },
            {
                name: 'normalWorld',
                desc: 'Normalized world normal.',
                type: 'vec3',
            },
            {
                name: 'transformedNormalView',
                desc: 'Transformed normal in view space.',
                type: 'vec3',
            },
            {
                name: 'transformedNormalWorld',
                desc: 'Normalized transformed normal in world space.',
                type: 'vec3',
            },
            {
                name: 'transformedClearcoatNormalView',
                desc: 'Transformed clearcoat normal in view space.',
                type: 'vec3',
            },
        ],
    ],

    [
        'Position',
        [
            {
                name: 'positionGeometry',
                desc: 'Position attribute of geometry.',
                type: 'vec3',
            },
            {
                name: 'positionLocal',
                desc: 'Local variable for position.',
                type: 'vec3',
            },
            { name: 'positionWorld', desc: 'World position.', type: 'vec3' },
            {
                name: 'positionWorldDirection',
                desc: 'Normalized world direction.',
                type: 'vec3',
            },
            { name: 'positionView', desc: 'View position.', type: 'vec3' },
            {
                name: 'positionViewDirection',
                desc: 'Normalized view direction.',
                type: 'vec3',
            },
        ],
    ],

    [
        'Tangent',
        [
            {
                name: 'tangentGeometry',
                desc: 'Tangent attribute of geometry.',
                type: 'vec4',
            },
            {
                name: 'tangentLocal',
                desc: 'Local variable for tangent.',
                type: 'vec3',
            },
            {
                name: 'tangentView',
                desc: 'Normalized view tangent.',
                type: 'vec3',
            },
            {
                name: 'tangentWorld',
                desc: 'Normalized world tangent.',
                type: 'vec3',
            },
            {
                name: 'transformedTangentView',
                desc: 'Transformed tangent in view space.',
                type: 'vec3',
            },
            {
                name: 'transformedTangentWorld',
                desc: 'Normalized transformed tangent in world space.',
                type: 'vec3',
            },
        ],
    ],

    [
        'Screen',
        [
            {
                name: 'screenUV',
                desc: 'Returns the normalized frame buffer coordinate.',
                type: 'vec2',
            },
            {
                name: 'screenCoordinate',
                desc: 'Returns the frame buffer coordinate in physical pixel units.',
                type: 'vec2',
            },
            {
                name: 'screentSize',
                desc: 'Returns the frame buffer size in physical pixel units.',
                type: 'vec2',
            },
        ],
    ],

    [
        'Viewport',
        [
            {
                name: 'viewportUV',
                desc: 'Returns the normalized viewport coordinate.',
                type: 'vec2',
            },
            {
                name: 'viewport',
                desc: 'Returns the viewport dimension in physical pixel units.',
                type: 'vec4',
            },
            {
                name: 'viewportCoordinate',
                desc: 'Returns the viewport coordinate in physical pixel units.',
                type: 'vec2',
            },
            {
                name: 'viewportSize',
                desc: 'Returns the viewport size in physical pixel units.',
                type: 'vec2',
            },
        ],
    ],

    [
        'Reflect',
        [
            {
                name: 'reflectView',
                desc: 'Computes reflection direction in view space.',
                type: 'vec3',
            },
            {
                name: 'reflectVector',
                desc: 'Transforms the reflection direction to world space.',
                type: 'vec3',
            },
        ],
    ],
];

export const tslInputNodes = tslInputs.map((group) => ({
    TypeClass: PropertiesNode,
    name: group[0],
    id: group[0].toLowerCase(),
    constructorArgs: [
        group[0],
        group[1],
        (s: string) => s.replace(group[0].toLowerCase(), ''),
    ],
}));
