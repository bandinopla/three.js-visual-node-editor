import { AnyMapping, ClampToEdgeWrapping, CubeReflectionMapping, CubeRefractionMapping, CubeUVReflectionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping, MirroredRepeatWrapping, RepeatWrapping, UVMapping, Wrapping } from "three"; 
import { Layout } from "../layout/Layout";
import { LayoutElement } from "../layout/LayoutElement";
import { ComboBox } from "../components/ComboBox";

type Mode = [ string, string ]

export class TextureMappingModeProperty extends LayoutElement
{
    private modes :Mode[] = [
        [ "THREE.UVMapping", "UV" ], 
        [ "THREE.CubeReflectionMapping", "Cube Reflection" ], 
        [ "THREE.CubeRefractionMapping", "Cube Refraction" ], 
        [ "THREE.CubeUVReflectionMapping", "Cube UV Reflection" ], 
        [ "THREE.EquirectangularReflectionMapping", "Equirectangular Reflection" ], 
        [ "THREE.EquirectangularRefractionMapping", "Equirectangular Refraction" ], 
    ];

    private combo:ComboBox;

    constructor() {
        super();

        this.xPadding = 10;  

        this.combo = new ComboBox("Mapping mode", this.modes.map(m=>m[1]), this.onComboChange.bind(this));

        this.layout = new Layout([
            this.combo
        ], {
            direction:"column",
            align:"stretch"
        });
    }

    /**
     * The type of UV mapping the object should have...
     */
    get mappingType() {
        return this.modes[ this.combo.index ][0];
    }

    protected onComboChange( i:number )
    { 
        this.root.update()
    }
}