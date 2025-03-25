import { ClampToEdgeWrapping, MirroredRepeatWrapping, RepeatWrapping, Wrapping } from "three"; 
import { Layout } from "../layout/Layout";
import { LayoutElement } from "../layout/LayoutElement";
import { ComboBox } from "../components/ComboBox";

type Mode = [ Wrapping, string ]

export class TextureExtensionProperty extends LayoutElement
{
    private modes :Mode[] = [
        [ RepeatWrapping, "Repeat" ],
        [ ClampToEdgeWrapping, "Clamp" ],
        [ MirroredRepeatWrapping, "Mirror" ]
    ];

    private combo:ComboBox;

    constructor() {
        super();

        this.xPadding = 10;  

        this.combo = new ComboBox("Wrapping mode", this.modes.map(m=>m[1]), this.onComboChange.bind(this));

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