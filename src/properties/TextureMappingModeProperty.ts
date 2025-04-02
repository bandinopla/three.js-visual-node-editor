import { ComboBoxProperty } from "./ComboBoxProperty";

export class TextureMappingModeProperty extends ComboBoxProperty {
    constructor() {
        super("Mapping Mode",[
            [ "THREE.UVMapping", "UV" ], 
            [ "THREE.CubeReflectionMapping", "Cube Reflection" ], 
            [ "THREE.CubeRefractionMapping", "Cube Refraction" ], 
            [ "THREE.CubeUVReflectionMapping", "Cube UV Reflection" ], 
            [ "THREE.EquirectangularReflectionMapping", "Equirectangular Reflection" ], 
            [ "THREE.EquirectangularRefractionMapping", "Equirectangular Refraction" ], 
        ]);
    }
}