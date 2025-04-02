import { Vector3Output } from '../../properties/Vector3Output';
import { TextureProperty } from '../../properties/TextureProperty';
import { Vector1Output } from '../../properties/Vector1Output'; 
import { TextureExtensionProperty } from "../../properties/TextureExtensionProperty";
import { TextureMappingModeProperty } from "../../properties/TextureMappingModeProperty";
import { UVTransformProperty } from "../../properties/UVTransformProperty";
import { TextureTypeNode } from "./BaseTextureNode";
import { Script } from '../../export/Script';
import { TextureColorSpaceProperty } from '../../properties/TextureColorSpaceProperty';
import { TextureInterpolationProperty } from '../../properties/TextureInterpolationProperty';
import { ComboBoxProperty } from '../../properties/ComboBoxProperty';
export class ImageTextureNode extends TextureTypeNode {
 
    private imageProp:TextureProperty;
    private uv:UVTransformProperty;
    private extensionPolicy:TextureExtensionProperty;
    private mappingPolicy:TextureMappingModeProperty;
    private colorSpace:TextureColorSpaceProperty;
    private interpolation:TextureInterpolationProperty;
    private useMipmaps:ComboBoxProperty;

    constructor() {
        super("Image Texture", 
            [
                new Vector3Output("Color"),
                new Vector1Output("Alpha").outputProp("a"),
                new TextureProperty(),   
                new ComboBoxProperty("generate Mipmaps", [
                    ["true", "use Mipmaps"],
                    ["false", "Don't use Mipmaps"]
                ]),
                new TextureInterpolationProperty(),
                new TextureExtensionProperty(),
                new TextureMappingModeProperty(),
                new TextureColorSpaceProperty(),
                new UVTransformProperty()
            ]
        ); 

        this.imageProp = this.getChildOfType(TextureProperty)!;
        this.uv = this.getChildOfType(UVTransformProperty)!;
        this.extensionPolicy = this.getChildOfType(TextureExtensionProperty)!;
        this.mappingPolicy = this.getChildOfType(TextureMappingModeProperty)!;
        this.colorSpace = this.getChildOfType(TextureColorSpaceProperty)!;
        this.interpolation = this.getChildOfType(TextureInterpolationProperty)!;
        this.useMipmaps = this.getChildOfType(ComboBoxProperty)!;
    }

    override writeScript(script: Script): string {
        
        script.importModule("texture");
         

        const map = script.loadTexture( 
            this.imageProp.imagePath, 
            this.imageProp.imageType,
            this.imageProp.imageSrc, 
            
            
            texture => `
${texture}.wrapS = ${ this.extensionPolicy.value };
${texture}.wrapT = ${ this.extensionPolicy.value };
${texture}.mapping = ${ this.mappingPolicy.value };
${texture}.colorSpace = ${ this.colorSpace.value };
${texture}.flipY = false;  
${texture}.generateMipmaps = ${ this.useMipmaps.value };   
${ this.interpolation.returnTextureSetupJs(texture) }
` 
        ) ;

        const uv = this.uv.writeScript(script); 

        return script.define( this.nodeName, `texture( ${map}, ${uv} )`);

    }

    override serialize(): Record<string, any> {
        return {
            ...super.serialize(),
            src: this.imageProp.isFromDisk? "" : this.imageProp.imageSrc,
            extension: this.extensionPolicy.value,
            mapping: this.mappingPolicy.value,
            colorSpace: this.colorSpace.value,
            interpolation: this.interpolation.value,
            usemipmap: this.useMipmaps.value,
        }
    }

    override unserialize(data: Record<string, any>): void {
        super.unserialize(data);

        if( data.src !="" )
            this.imageProp.src = data.src;

        this.extensionPolicy.value = data.extension;
        this.mappingPolicy.value = data.mapping;
        this.colorSpace.value = data.colorSpace;
        this.interpolation.value = data.interpolation;
        this.useMipmaps.value = data.usemipmap;
    }

    override onRemoved(): void {
        super.onRemoved();
        this.imageProp.dispose();
    }
}