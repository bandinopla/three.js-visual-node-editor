import { AnyMapping, ClampToEdgeWrapping, CubeReflectionMapping, CubeRefractionMapping, CubeUVReflectionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping, MirroredRepeatWrapping, RepeatWrapping, UVMapping, Wrapping } from "three"; 
import { Layout } from "../layout/Layout";
import { LayoutElement } from "../layout/LayoutElement";
import { ComboBox } from "../components/ComboBox";

type Mode = [ AnyMapping, string ]

export class TextureMappingModeProperty extends LayoutElement
{
    private modes :Mode[] = [
        [ UVMapping, "UV" ], 
        [ CubeReflectionMapping, "Cube Reflection" ], 
        [ CubeRefractionMapping, "Cube Refraction" ], 
        [ CubeUVReflectionMapping, "Cube UV Reflection" ], 
        [ EquirectangularReflectionMapping, "Equirectangular Reflection" ], 
        [ EquirectangularRefractionMapping, "Equirectangular Refraction" ], 
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

    protected onComboChange( i:number )
    {
        // todo: do somehting.
    }
}