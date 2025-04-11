import { FillStyle, Theme } from '../colors/Theme';
import { IScript } from '../export/IScript';
import { Node } from '../nodes/Node';

export enum DataSize {
    wildcard,
    vec1,
    vec2,
    vec3,
    vec4,
    material,
    script,
} //<---- 0=any type except type 5...

export const DataSize2Color = [
    'white',
    Theme.config.vec1,
    Theme.config.vec2,
    Theme.config.vec3,
    Theme.config.vec4,
    Theme.config.materialOutputSocketColor,
    Theme.config.scriptSocketColor,
];

export interface IDataType {
    /**
     * number of components. `0` means it accepts any size as input and will copy the size and type of the input.
     */
    size: DataSize;

    /**
     * if `true` it means it will hold only integer values
     */
    int?: boolean;

    /**
     * `true` means the values will be either 1 or 0
     */
    bool?: boolean;

    /**
     * if true it means the values wont be negative
     */
    unsigned?: boolean;

    /**
     * If it is a matrix...
     */
    matrix?: boolean;
}

/**
 * Utility class to have sample config for each type
 */
export const DataType = {
    wildcard: { size: DataSize.wildcard },
    material: { size: DataSize.material },
    script: { size: DataSize.script },

    int: { size: 1, int: true },
    uint: { size: 1, int: true, unsigned: true },
    float: { size: 1 },
    bool: { size: 1, bool: true },

    vec1: { size: 1 },
    vec2: { size: 2 },
    vec3: { size: 3 },
    vec4: { size: 4 },

    uvec1: { size: 1, unsigned: true, int: true },
    uvec2: { size: 2, unsigned: true, int: true },
    uvec3: { size: 3, unsigned: true, int: true },
    uvec4: { size: 4, unsigned: true, int: true },

    ivec1: { size: 1, unsigned: false, int: true },
    ivec2: { size: 2, unsigned: false, int: true },
    ivec3: { size: 3, unsigned: false, int: true },
    ivec4: { size: 4, unsigned: false, int: true },

    bvec1: { size: 1, bool: true },
    bvec2: { size: 2, bool: true },
    bvec3: { size: 3, bool: true },
    bvec4: { size: 4, bool: true },

    mat2: { size: 2, matrix: true },
    mat3: { size: 3, matrix: true },
    mat4: { size: 4, matrix: true },
} as const satisfies Partial<Record<string, IDataType>>;

export const DataTypes: { name: string; type: IDataType }[] = Object.keys(
    DataType,
).map((name) => ({
    name,
    type: DataType[name as keyof typeof DataType],
}));

export interface IOutlet extends IScript {
    isInput: boolean;

    globalX: number;
    globalY: number;

    /**
     * If we are an input, we are going to feed from this outlet.
     * If we are an output, the other outlet will feed from us.
     */
    connectedTo?: IOutlet;

    /**
     * The current data type of this outlet
     */
    type: IDataType;

    /**
     * If it has an error, this prop should contain the text explaining what happened.
     */
    error?: string;

    get owner(): Node;

    /**
     * Color representative of this outlet...
     */
    get color(): FillStyle;

    /**
     * used to name the variable that will hold it's value in js.
     */
    outletName: string;

    /**
     * By default you can output many connections from this outlet unless you set this to `true`
     */
    onlyOneOutputAllowed?: boolean;

    /**
     * Should return `true` if the type of the other outlet is compatible wth our's
     */
    isCompatible(other: IOutlet): boolean;

    get acceptsInputs(): boolean;

    /**
     * Update our state making sure we are representing the right type...
     * And if we are an output node, we should also call this method on the connected input node on the other side...
     * Meaning: change the type settings of the outlet reading the corresponding source of data `connectedTo` or `owner` in the case of a !isInput
     */
    updateType(): void;
}
