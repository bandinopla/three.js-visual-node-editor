# three.js TSL Visual Node Editor

### :rocket: [Launch Editor (Alpha)](https://bandinopla.github.io/three.js-visual-node-editor/) :rocket:
Video preview of how it works: https://x.com/bandinopla/status/1910107425589330196
*remember it is in alpha state, errors might occur, check the console and report if you can*


[![cover](/git-cover.png)](https://bandinopla.github.io/three.js-visual-node-editor/) 

## **[!] Work in progress | Alpha state** <br/>
Visual node editor, inspired by [Blender's shader editor](https://www.blender.org/), is a tool to visually build [Three.js](https://threejs.org/) materials using [Three.js-Shading-Language](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language).  The socket proximity detection was inspired by [Kennedy Richard](https://x.com/KennedyRichard)'s [Nodezator's node editor](https://x.com/KennedyRichard/status/1823905562192449762)
 
 

### :bookmark_tabs: Read the [WIKI / Documentation](https://github.com/bandinopla/three.js-visual-node-editor/wiki) to collaborate!
> short text, just an overview of the concepts. It is not a blob of text! The code is commented anyways.

# Let's build this together!
The idea is to let everybody add nodes and have this be the best shader node editor in the galaxy. To do so, you must check the [Three.js-Shading-Language Docs](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language) to know how to implement the TSL sintax.

You can also fix bugs or improve the code/interface. Just clone and do a pull request.

# == STATUS == 

### TSL to Visual Nodes:
- :white_check_mark: UV Channel
- :warning: Preview
- :warning: Functions
- :warning: Uniform
- Conditional / Logic
    - :warning: If
    - :warning: Declare & Assign variables
    - :no_entry: Ternary
    - :warning: Loop
    - :warning: Swizzle
- NodeMaterial
    - :no_entry: fragmentNode
    - :no_entry: vertexNode
    - :no_entry: geometryNode
    - :white_check_mark: colorNode
    - :no_entry: depthNode
    - :no_entry: opacityNode
    - :no_entry: alphaTestNode
    - Lighting
        - :no_entry: emissiveNode
        - :white_check_mark: normalNode
        - :no_entry: lightsNode
        - :no_entry: envNode
    - Backdrop
        - :no_entry: backdropNode
        - :no_entry: backdropAlphaNode
    - :no_entry: positionNode
    - Shadows
        - :no_entry: castShadowNode
        - :no_entry: receivedShadowNode
        - :no_entry: shadowPositionNode
        - :no_entry: aoNode
    - Output:
        - :no_entry: rtNode
        - :no_entry: outputNode
- :no_entry: LineDashedNodeMaterial
    - :no_entry: dashScaleNode
    - :no_entry: dashSizeNode
    - :no_entry: gapSizeNode
    - :no_entry: offsetNode
- :no_entry: MeshPhongNodeMaterial
    - :no_entry: shininessNode
    - :no_entry: specularNode
- :white_check_mark: MeshStandardNode  
    - :white_check_mark: roughness
    - :white_check_mark: metallic 
- :no_entry: MeshPhysicalNodeMaterial
    - :no_entry: clearcoatNode
    - :no_entry: clearcoatRoughnessNode
    - :no_entry: clearcoatNormalNode
    - :no_entry: sheenNode
    - :no_entry: iridescenceNode
    - :no_entry: iridescenceIORNode
    - :no_entry: iridescenceThicknessNode
    - :no_entry: specularIntensityNode
    - :no_entry: specularColorNode
    - :no_entry: iorNode
    - :no_entry: transmissionNode
    - :no_entry: thicknessNode
    - :no_entry: attenuationDistanceNode
    - :no_entry: attenuationColorNode
    - :no_entry: dispersionNode
    - :no_entry: anisotropyNode
- :no_entry: SpriteNodeMaterial
    - :no_entry: positionNode
    - :no_entry: rotationNode
    - :no_entry: scaleNode


- :white_check_mark: Image texture node
- :warning: Operators (not fully tested)
    - :white_check_mark: add
    - :white_check_mark: sub
    - :white_check_mark: mul
    - :white_check_mark: div
    - :white_check_mark: assign
    - :white_check_mark: mod
    - :white_check_mark: equal
    - :white_check_mark: notEqual
    - :white_check_mark: lessThan
    - :white_check_mark: greaterThan
    - :white_check_mark: lessThanEqual
    - :white_check_mark: greaterThanEqual
    - :white_check_mark: and
    - :white_check_mark: or
    - :white_check_mark: not
    - :white_check_mark: xor
    - :white_check_mark: bitAnd
    - :white_check_mark: bitNot
    - :white_check_mark: bitOr
    - :white_check_mark: bitXor
    - :white_check_mark: shiftLeft
    - :white_check_mark: shiftRight
- Math
    - :white_check_mark: mx_noise_float
    - :white_check_mark: abs  
    - :white_check_mark: acos  
    - :white_check_mark: all  
    - :white_check_mark: any  
    - :white_check_mark: asin  
    - :white_check_mark: atan  
    - :white_check_mark: bitcast  
    - :white_check_mark: cbrt  
    - :white_check_mark: ceil  
    - :white_check_mark: clamp  
    - :white_check_mark: cos  
    - :white_check_mark: cross  
    - :white_check_mark: dFdx  
    - :white_check_mark: dFdy  
    - :white_check_mark: degrees  
    - :white_check_mark: difference  
    - :white_check_mark: distance  
    - :white_check_mark: dot  
    - :white_check_mark: equals  
    - :white_check_mark: exp  
    - :white_check_mark: exp2  
    - :white_check_mark: faceforward  
    - :white_check_mark: floor  
    - :white_check_mark: fract  
    - :white_check_mark: fwidth  
    - :white_check_mark: inverseSqrt  
    - :white_check_mark: invert  
    - :white_check_mark: length  
    - :white_check_mark: lengthSq  
    - :white_check_mark: log  
    - :white_check_mark: log2  
    - :white_check_mark: max  
    - :white_check_mark: min  
    - :white_check_mark: mix  
    - :white_check_mark: negate  
    - :white_check_mark: normalize  
    - :white_check_mark: oneMinus  
    - :white_check_mark: pow  
    - :white_check_mark: pow2  
    - :white_check_mark: pow3  
    - :white_check_mark: pow4  
    - :white_check_mark: radians  
    - :white_check_mark: reciprocal  
    - :white_check_mark: reflect  
    - :white_check_mark: refract  
    - :white_check_mark: round  
    - :white_check_mark: saturate  
    - :white_check_mark: sign  
    - :white_check_mark: sin  
    - :white_check_mark: smoothstep  
    - :white_check_mark: sqrt  
    - :white_check_mark: step  
    - :white_check_mark: tan  
    - :white_check_mark: transformDirection  
    - :white_check_mark: trunc   

- :white_check_mark: Value Node (float uniform ) 
- Textures
    - :white_check_mark: Image texture
    - :no_entry: Cube texture
    - :no_entry: Triplanar texture
- Attributes
    - :white_check_mark: UV
    - :no_entry: vertexColor
    - :no_entry: custom attribute
- Position:
    - :white_check_mark: positionGeometry  
    - :white_check_mark: positionLocal  
    - :white_check_mark: positionWorld  
    - :white_check_mark: positionWorldDirection  
    - :white_check_mark: positionView  
    - :white_check_mark: positionViewDirection  
- Normal:
    - :white_check_mark: normalGeometry  
    - :white_check_mark: normalLocal  
    - :white_check_mark: normalView  
    - :white_check_mark: normalWorld  
    - :white_check_mark: transformedNormalView  
    - :white_check_mark: transformedNormalWorld  
    - :white_check_mark: transformedClearcoatNormalView  
- Tangent:
    - :white_check_mark: tangentGeometry  
    - :white_check_mark: tangentLocal  
    - :white_check_mark: tangentView  
    - :white_check_mark: tangentWorld  
    - :white_check_mark: transformedTangentView  
    - :white_check_mark: transformedTangentWorld  
- Bitangent:
    - :white_check_mark: bitangentGeometry  
    - :white_check_mark: bitangentLocal  
    - :white_check_mark: bitangentView  
    - :white_check_mark: bitangentWorld  
    - :white_check_mark: transformedBitangentView  
    - :white_check_mark: transformedBitangentWorld  
- Camera:
    - :white_check_mark: cameraNear  
    - :white_check_mark: cameraFar  
    - :white_check_mark: cameraProjectionMatrix  
    - :white_check_mark: cameraProjectionMatrixInverse  
    - :white_check_mark: cameraViewMatrix  
    - :white_check_mark: cameraWorldMatrix  
    - :white_check_mark: cameraNormalMatrix  
    - :white_check_mark: cameraPosition  
- Model:
    - :white_check_mark: modelDirection  
    - :white_check_mark: modelViewMatrix  
    - :white_check_mark: modelNormalMatrix  
    - :white_check_mark: modelWorldMatrix  
    - :white_check_mark: modelPosition  
    - :white_check_mark: modelScale  
    - :white_check_mark: modelViewPosition  
    - :white_check_mark: modelWorldMatrixInverse  
    - :white_check_mark: highpModelViewMatrix  
    - :white_check_mark: highpModelNormalViewMatrix  
- Screen:
    - :white_check_mark: screenUV  
    - :white_check_mark: screenCoordinate  
    - :white_check_mark: screentSize  
- Viewport:
    - :white_check_mark: viewportUV  
    - :white_check_mark: viewport  
    - :white_check_mark: viewportCoordinate  
    - :white_check_mark: viewportSize  
- Blend Modes:
    - :white_check_mark: blendBurn  
    - :white_check_mark: blendDodge  
    - :white_check_mark: blendOverlay  
    - :white_check_mark: blendScreen  
    - :white_check_mark: blendColor  
- Reflect
    - :no_entry:  reflectView
    - :no_entry:  reflectVector
- UV Utils
    - :no_entry: matcapUV  
    - :no_entry: rotateUV  
    - :no_entry: spherizeUV  
    - :no_entry: spritesheetUV  
    - :no_entry: equirectUV  
- Interpolation
    - :no_entry: remap  
    - :no_entry: remapClamp  
- Random
    - :no_entry: hash
    - :no_entry: range
- :no_entry: rotate 
- Oscillator
    - :no_entry: oscSine
    - :no_entry: oscSquare
    - :no_entry: oscTriangle
    - :no_entry: oscSawtooth
- Packing
    - :no_entry: directionToColor
    - :no_entry: colorToDirection