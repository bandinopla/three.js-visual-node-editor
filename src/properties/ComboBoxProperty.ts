import { AnyMapping, ClampToEdgeWrapping, CubeReflectionMapping, CubeRefractionMapping, CubeUVReflectionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping, MirroredRepeatWrapping, RepeatWrapping, UVMapping, Wrapping } from "three"; 
import { Layout } from "../layout/Layout";
import { LayoutElement } from "../layout/LayoutElement";
import { ComboBox } from "../components/ComboBox";

type Mode = [ string, string ]

export class ComboBoxProperty extends LayoutElement
{ 

    private combo:ComboBox;

    constructor( title:string, protected modes :Mode[]) {
        super();

        //this.xPadding = 10;  

        this.combo = new ComboBox(title, this.modes.map(m=>m[1]), this.onComboChange.bind(this));

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
    get value() {
        return this.modes[ this.combo.index ][0];
    }

    set value( mapping:string ) {
        this.combo.index = this.modes.findIndex(m=>m[0]==mapping);
    }

    protected onComboChange( i:number )
    { 
        this.root.update()
    }
}