import { ComboBoxProperty } from "./ComboBoxProperty"; 

export class TextureExtensionProperty extends ComboBoxProperty {
    constructor() {
        super("Wrapping mode", [
            [ "THREE.RepeatWrapping", "Repeat" ],
            [ "THREE.ClampToEdgeWrapping", "Clamp" ],
            [ "THREE.MirroredRepeatWrapping", "Mirror" ]
        ])
    }
} 