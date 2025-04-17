import { IDataType } from '../../core/IOutlet';
import { MathOperatorNode } from './MathOperatorNode';

/**
 * Here a made a system to parse TSL definitions from a string because of lazyness.
 * These are the types recognized by the parser:
 *
 * - * --> wildcard, everything accepted except a matrix...
 * - T --> will copy the type of the operand 1
 * - vec --> any type of vector
 * - bvec --> boolean vector
 * - ivec --> integer vector
 * - uvec --> unsigned int vector
 * - bool
 * - float
 * - Type --> the name of all possible types
 * - vec2+ --> vector with minimum number of component...
 * - mat --> matrix
 * - lerpFactor --> a float that will be between 0 and 1 and will render a slider
 */

//.assign(target:*, value:T):T
const mathOperators = `.add(target: *, value: T): T
.sub(target: *, value: T): T
.mul(target: *, value: T): T
.div(target: *, value: T): T
.mod(target: *, value: T): T

.equal(target: *, value: T): bvec
.notEqual(target: *, value: T): bvec
.lessThan(target: float, value: T): bool
.greaterThan(target: float, value: T): bool
.lessThanEqual(target: float, value: T): bool
.greaterThanEqual(target: float, value: T): bool

.and(target: bvec, value: T): bvec
.or(target: bvec, value: T): bvec
.not(target: bvec | ivec): bvec

.xor(target: ivec, value: ivec): ivec
.bitAnd(target: ivec, value: ivec | uvec): ivec
.bitNot(target: ivec): ivec
.bitOr(target: ivec, value: ivec | uvec): ivec
.bitXor(target: ivec, value: ivec | uvec): ivec
.shiftLeft(target: ivec, value: ivec | uvec): ivec
.shiftRight(target: ivec, value: ivec | uvec): ivec
`;

//TODO: bitcast(x:*, y:Type):Type

const mathFunction = `EPSILON
INFINITY
mx_noise_float(pos:vec2, amplitude:float, pivot:float):float
abs(x:*):T
acos(x:vec):vec
all(x:bvec):bool
any(x:bvec):bool
asin(x:vec):vec
atan(y:vec, x:vec):vec
cbrt(x:vec):vec
ceil(x:vec):vec
clamp(x:*, min:T, max:T):T
cos(x:vec):vec
cross(x:vec3, y:T):T
dFdx(p:vec):vec
dFdy(p:vec):vec
degrees(radians:float):float
difference(x:*, y:T):T
distance(x:vec, y:vec):float
dot(x:vec, y:vec):float
equals(x:*, y:T):bool
exp(x:float):float
exp2(x:float):float
faceforward(N:vec, I:vec, Nref:vec):vec
floor(x:vec):vec
fract(x:vec):vec
fwidth(x:vec):vec
inverseSqrt(x:vec):vec
length(x:vec):float
lengthSq(x:vec):float
log(x:vec):vec
log2(x:vec):vec
max(x:*, y:T):T
min(x:*, y:T):T
mix(x:*, y:T, a:lerpFactor):T
negate(x:*):T
normalize(x:vec):vec
oneMinus(x:vec):vec
pow(x:vec, y:vec|float):vec
pow2(x:vec):vec
pow3(x:vec):vec
pow4(x:vec):vec
radians(degrees:vec):vec
reciprocal(x:vec):vec
reflect(I:vec, N:vec):vec
refract(I:vec, N:vec, eta:float):vec
round(x:vec):vec
saturate(x:vec):vec
sign(x:vec):vec
sin(x:vec):vec
smoothstep(e0:vec|float, e1:vec|float, x:vec):vec
sqrt(x:vec):vec
step(edge:vec|float, x:vec):vec
tan(x:vec):vec
transformDirection(dir:vec2+, matrix:mat):vec
trunc(x:vec):vec`;

export type MathOpParam = {
    typeId: string;
    size?: number;
    minium?: boolean;
    isCompatible: typeof isCompatible;
};

export type MathOpDef = {
    fnName: string;
    returns: MathOpParam[];
    params?: { name: string; type: MathOpParam[] }[];
};

/**
 * Checks to see if the outlet has a compatible type with the one we used to quickly describe methods with a string...
 */
function isCompatible(this: MathOpParam, other: IDataType, strict = false) {
    if (
        this.typeId === 'Type' ||
        other.size > 4 ||
        this.typeId.startsWith('mat') != !!other.matrix
    )
        return false;
    if (this.typeId === '*' || this.typeId === 'T') return true; //Calling this method on a T doesn't make sense it will probably never happen...

    const otype = other;
    const isScalar = ['int', 'uint', 'float', 'bool', 'lerpFactor'].includes(
        this.typeId,
    );
    const minSize = this.size ?? 1;
    const maxSize = this.minium || (!this.size && !isScalar) ? 4 : minSize;

    if (!strict) {
        // whatever make everything compatible we will convert anyway...
        return other.size >= minSize && other.size <= maxSize;
    }

    const bool = this.typeId.startsWith('b');
    const int = this.typeId.indexOf('i') > -1; //this.typeId.startsWith("i") || this.typeId === "int" || this.typeId === "uint";
    const unsigned = this.typeId.startsWith('u');
    const matrix = this.typeId.startsWith('m');

    return (
        (!bool || otype.bool) &&
        (!int || otype.int) &&
        (!unsigned || otype.unsigned) &&
        (!matrix || otype.matrix) &&
        otype.size >= minSize &&
        otype.size <= maxSize
    );
}

function parse(str: string): MathOpDef[] {
    const parseType = (type: string): MathOpParam => {
        type = type.trim();

        const m = type.match(/(?<type>.*)(?<size>\d)(?<minimum>\+)?/);
        if (m) {
            return {
                typeId: m.groups!.type,
                size: parseInt(m.groups!.size),
                minium: !!m.groups!.minimum,
                isCompatible,
            };
        }

        return { typeId: type.trim(), isCompatible };
    };

    return str
        .split(/\n/)
        .filter((line) => line.length)
        .map((line) => {
            const start = line.indexOf('(');

            if (start < 0) {
                return {
                    fnName: line,
                    returns: [
                        {
                            typeId: 'float',
                            size: 1,
                            isCompatible: () => false,
                        },
                    ],
                };
            }

            const end = line.lastIndexOf('):');
            const rtrn = line
                .substring(end + 2)
                .split('|')
                .map(parseType);
            const fnName = line.substring(0, start);
            const params = line
                .substring(start + 1, end)
                .split(',')
                .filter((p) => !p.includes('...'))
                .map((param) => {
                    const [paramName, paramType] = param.trim().split(':');
                    return {
                        name: paramName,
                        type: paramType?.split('|').map(parseType),
                    };
                });

            return {
                fnName,
                returns: rtrn,
                params,
            };
        });
}

//     //blend modes
//     { "name": "blendBurn", "params": 2, "desc": "Returns the burn blend mode." },
//     { "name": "blendDodge", "params": 2, "desc": "Returns the dodge blend mode." },
//     { "name": "blendOverlay", "params": 2, "desc": "Returns the overlay blend mode." },
//     { "name": "blendScreen", "params": 2, "desc": "Returns the screen blend mode." },
//     { "name": "blendColor", "params": 2, "desc": "Returns the (normal) color blend mode." }
// ]

function mathDef2NodeDef(def: MathOpDef) {
    return {
        TypeClass: MathOperatorNode,
        name: def.fnName,
        id: def.fnName,
        constructorArgs: def,
    };
}

export const mathOperatonNodes = parse(mathOperators).map(mathDef2NodeDef);
export const mathFunctionNodes = parse(mathFunction).map(mathDef2NodeDef);
