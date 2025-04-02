import { ComboBoxProperty } from "./ComboBoxProperty";

export class TextureInterpolationProperty extends ComboBoxProperty {
    constructor() {
        super("Interpolation",[
            [ "THREE.NearestFilter", "Nearest" ], 
            [ "THREE.LinearFilter", "Linear" ],  
            [ "THREE.NearestMipmapNearestFilter", "Nearest, Mipmap Nearest" ],  
            [ "THREE.NearestMipmapLinearFilter", "Nearest, Mipmap Linear" ],  
            [ "THREE.LinearMipmapNearestFilter", "Linear, Mipmap Nearest" ],  
            [ "THREE.LinearMipmapLinearFilter", "Linear, Mipmap Linear" ],  
        ]);
    }

    returnTextureSetupJs( textureName:string ) { 

        return `
${ textureName}.magFilter = ${ this.value.includes(".Linear")? this.modes[0][0] : this.modes[1][0] };        
${ textureName}.minFilter = ${ this.value  };        
        `;
    }
}