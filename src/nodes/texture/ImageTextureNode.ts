import { Vector3Output } from '../../properties/Vector3Output';
import { TextureProperty } from '../../properties/TextureProperty';
import { Vector1Output } from '../../properties/Vector1Output'; 
import { TextureExtensionProperty } from "../../properties/TextureExtensionProperty";
import { TextureMappingModeProperty } from "../../properties/TextureMappingModeProperty";
import { UVTransformProperty } from "../../properties/UVTransformProperty";
import { TextureTypeNode } from "./BaseTextureNode";
import { Script } from '../../export/Script';
export class ImageTextureNode extends TextureTypeNode {
 
    private imageProp:TextureProperty;
    private uv:UVTransformProperty;
    private extensionPolicy:TextureExtensionProperty;
    private mappingPolicy:TextureMappingModeProperty;

    constructor() {
        super("Image Texture", 
            [
                new Vector3Output("Color"),
                new Vector1Output("Alpha").outputProp("a"),
                new TextureProperty(),   
                new TextureExtensionProperty(),
                new TextureMappingModeProperty(),
                new UVTransformProperty()
            ]
        ); 

        this.imageProp = this.getChildOfType(TextureProperty)!;
        this.uv = this.getChildOfType(UVTransformProperty)!;
        this.extensionPolicy = this.getChildOfType(TextureExtensionProperty)!;
        this.mappingPolicy = this.getChildOfType(TextureMappingModeProperty)!;
    }

    override writeScript(script: Script): string {
        
        script.importModule("texture");
         

        const map = script.loadTexture( this.imageProp.imagePath, this.imageProp.imageSrc, texture => `
            ${texture}.wrapS = ${ this.extensionPolicy.extensionMode };
            ${texture}.wrapT = ${ this.extensionPolicy.extensionMode };
            ${texture}.mapping = ${ this.mappingPolicy.mappingType };
            ${texture}.flipY = false; 

            ` ) ;

        const uv = this.uv.writeScript(script);
        

        return script.define( this.nodeName, `texture( ${map}, ${uv} )`);

    }

    override serialize(): Record<string, any> {
        return {
            ...super.serialize(),
            src: this.imageProp.isFromDisk? "" : this.imageProp.imageSrc,
            extension: this.extensionPolicy.extensionMode,
            mapping: this.mappingPolicy.mappingType
        }
    }

    override unserialize(data: Record<string, any>): void {
        super.unserialize(data);

        if( data.src !="" )
            this.imageProp.src = data.src;

        this.extensionPolicy.extensionMode = data.extension;
        this.mappingPolicy.mappingType = data.mapping;
    }
}