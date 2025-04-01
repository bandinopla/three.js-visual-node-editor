export type MethodCallDef = {
    name:string
    params:number
    desc:string 
    symbol?:string

    /**
     * If true it means the name is the name of a function, not the name of a method in the 1st input.
     */
    isStandalone?:boolean
}

export const mathOperations :MethodCallDef[] = [
    { "name": "add", "params": 2, "desc": "Return the addition of two or more value.", "symbol": "+" },
    { "name": "sub", "params": 2, "desc": "Return the subtraction of two or more value.", "symbol": "−" },
    { "name": "mul", "params": 2, "desc": "Return the multiplication of two or more value.", "symbol": "×" },
    { "name": "div", "params": 2, "desc": "Return the division of two or more value.", "symbol": "÷" },
    { "name": "assign", "params": 2, "desc": "Assign one or more value to a and return the same.", "symbol": "=" },
    { "name": "mod", "params": 2, "desc": "Computes the remainder of dividing the first node by the second.", "symbol": "%" },
    { "name": "equal", "params": 2, "desc": "Checks if two nodes are equal.", "symbol": "==" },
    { "name": "notEqual", "params": 2, "desc": "Checks if two nodes are not equal.", "symbol": "≠" },
    { "name": "lessThan", "params": 2, "desc": "Checks if the first node is less than the second.", "symbol": "<" },
    { "name": "greaterThan", "params": 2, "desc": "Checks if the first node is greater than the second.", "symbol": ">" },
    { "name": "lessThanEqual", "params": 2, "desc": "Checks if the first node is less than or equal to the second.", "symbol": "≤" },
    { "name": "greaterThanEqual", "params": 2, "desc": "Checks if the first node is greater than or equal to the second.", "symbol": "≥" },
    { "name": "and", "params": 2, "desc": "Performs logical AND on two nodes.", "symbol": "&&" },
    { "name": "or", "params": 2, "desc": "Performs logical OR on two nodes.", "symbol": "||" },
    { "name": "not", "params": 1, "desc": "Performs logical NOT on a node.", "symbol": "!" },
    { "name": "xor", "params": 2, "desc": "Performs logical XOR on two nodes.", "symbol": "⊕" },
    { "name": "bitAnd", "params": 2, "desc": "Performs bitwise AND on two nodes.", "symbol": "&" },
    { "name": "bitNot", "params": 1, "desc": "Performs bitwise NOT on a node.", "symbol": "~" },
    { "name": "bitOr", "params": 2, "desc": "Performs bitwise OR on two nodes.", "symbol": "|" },
    { "name": "bitXor", "params": 2, "desc": "Performs bitwise XOR on two nodes.", "symbol": "^" },
    { "name": "shiftLeft", "params": 2, "desc": "Shifts a node to the left.", "symbol": "<<" },
    { "name": "shiftRight", "params": 2, "desc": "Shifts a node to the right.", "symbol": ">>" }
];

export const mathFunctions :MethodCallDef[] = [ 
    { "name": "EPSILON", "params": 0, "desc": "A small value used to handle floating-point precision errors." },
    { "name": "INFINITY", "params": 0, "desc": "Represent infinity." },
    { "name": "abs", "params": 1, "desc": "Return the absolute value of the parameter." },
    { "name": "acos", "params": 1, "desc": "Return the arccosine of the parameter." },
    { "name": "all", "params": 1, "desc": "Return true if all components of x are true." },
    { "name": "any", "params": 1, "desc": "Return true if any component of x is true." },
    { "name": "asin", "params": 1, "desc": "Return the arcsine of the parameter." },
    { "name": "atan", "params": 2, "desc": "Return the arc-tangent of the parameters." },
    { "name": "bitcast", "params": 2, "desc": "Reinterpret the bits of a value as a different type." },
    { "name": "cbrt", "params": 1, "desc": "Return the cube root of the parameter." },
    { "name": "ceil", "params": 1, "desc": "Find the nearest integer that is greater than or equal to the parameter." },
    { "name": "clamp", "params": 3, "desc": "Constrain a value to lie between two further values." },
    { "name": "cos", "params": 1, "desc": "Return the cosine of the parameter." },
    { "name": "cross", "params": 2, "desc": "Calculate the cross product of two vectors." },
    { "name": "dFdx", "params": 1, "desc": "Return the partial derivative of an argument with respect to x." },
    { "name": "dFdy", "params": 1, "desc": "Return the partial derivative of an argument with respect to y." },
    { "name": "degrees", "params": 1, "desc": "Convert a quantity in radians to degrees." },
    { "name": "difference", "params": 2, "desc": "Calculate the absolute difference between two values." },
    { "name": "distance", "params": 2, "desc": "Calculate the distance between two points." },
    { "name": "dot", "params": 2, "desc": "Calculate the dot product of two vectors." },
    { "name": "equals", "params": 2, "desc": "Return true if x equals y." },
    { "name": "exp", "params": 1, "desc": "Return the natural exponentiation of the parameter." },
    { "name": "exp2", "params": 1, "desc": "Return 2 raised to the power of the parameter." },
    { "name": "faceforward", "params": 3, "desc": "Return a vector pointing in the same direction as another." },
    { "name": "floor", "params": 1, "desc": "Find the nearest integer less than or equal to the parameter." },
    { "name": "fract", "params": 1, "desc": "Compute the fractional part of the argument." },
    { "name": "fwidth", "params": 1, "desc": "Return the sum of the absolute derivatives in x and y." },
    { "name": "inverseSqrt", "params": 1, "desc": "Return the inverse of the square root of the parameter." },
    { "name": "invert", "params": 1, "desc": "Invert an alpha parameter ( 1. - x )." },
    { "name": "length", "params": 1, "desc": "Calculate the length of a vector." },
    { "name": "lengthSq", "params": 1, "desc": "Calculate the squared length of a vector." },
    { "name": "log", "params": 1, "desc": "Return the natural logarithm of the parameter." },
    { "name": "log2", "params": 1, "desc": "Return the base 2 logarithm of the parameter." },
    { "name": "max", "params": 2, "desc": "Return the greater of two values." },
    { "name": "min", "params": 2, "desc": "Return the lesser of two values." },
    { "name": "mix", "params": 3, "desc": "Linearly interpolate between two values." },
    { "name": "negate", "params": 1, "desc": "Negate the value of the parameter ( -x )." },
    { "name": "normalize", "params": 1, "desc": "Calculate the unit vector in the same direction as the original vector." },
    { "name": "oneMinus", "params": 1, "desc": "Return 1 minus the parameter." },
    { "name": "pow", "params": 2, "desc": "Return the value of the first parameter raised to the power of the second." },
    { "name": "pow2", "params": 1, "desc": "Return the square of the parameter." },
    { "name": "pow3", "params": 1, "desc": "Return the cube of the parameter." },
    { "name": "pow4", "params": 1, "desc": "Return the fourth power of the parameter." },
    { "name": "radians", "params": 1, "desc": "Convert a quantity in degrees to radians." },
    { "name": "reciprocal", "params": 1, "desc": "Return the reciprocal of the parameter (1/x)." },
    { "name": "reflect", "params": 2, "desc": "Calculate the reflection direction for an incident vector." },
    { "name": "refract", "params": 3, "desc": "Calculate the refraction direction for an incident vector." },
    { "name": "round", "params": 1, "desc": "Round the parameter to the nearest integer." },
    { "name": "saturate", "params": 1, "desc": "Constrain a value between 0 and 1." },
    { "name": "sign", "params": 1, "desc": "Extract the sign of the parameter." },
    { "name": "sin", "params": 1, "desc": "Return the sine of the parameter." },
    { "name": "smoothstep", "params": 3, "desc": "Perform Hermite interpolation between two values." },
    { "name": "sqrt", "params": 1, "desc": "Return the square root of the parameter." },
    { "name": "step", "params": 2, "desc": "Generate a step function by comparing two values." },
    { "name": "tan", "params": 1, "desc": "Return the tangent of the parameter." },
    { "name": "transformDirection", "params": 2, "desc": "Transform the direction of a vector by a matrix and then normalize the result." },
    { "name": "trunc", "params": 1, "desc": "Truncate the parameter, removing the fractional part." },

    //blend modes
    { "name": "blendBurn", "params": 2, "desc": "Returns the burn blend mode." },
    { "name": "blendDodge", "params": 2, "desc": "Returns the dodge blend mode." },
    { "name": "blendOverlay", "params": 2, "desc": "Returns the overlay blend mode." },
    { "name": "blendScreen", "params": 2, "desc": "Returns the screen blend mode." },
    { "name": "blendColor", "params": 2, "desc": "Returns the (normal) color blend mode." }
]