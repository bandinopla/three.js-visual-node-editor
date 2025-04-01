import { Color } from "three";
import { Theme } from "../../colors/Theme";
import { ComboBox } from "../../components/ComboBox";
import { ColorInputProperty } from "../../properties/ColorInputProperty";
import { InputOrValue } from "../../properties/InputOrValue";
import { WinNode } from "../WinNode";  
import { Script } from "../../export/Script"; 
import { Output } from "../../properties/Output"; 
 

export class NormalMapNode extends WinNode {
    protected typeCombo:ComboBox;
    protected strength:InputOrValue;
    protected color:ColorInputProperty; 

    constructor() {

        const typeCombo = new ComboBox("Space", [
            "Tangent Space",
            "Object Space",
            "World Space"
        ], v=>this.onTypeComboChange(v));

        const strength = new InputOrValue(1, { label:"Stength", min:0, max:10, step:0.1, asBar:true, defaultValue:1 });

        const color = new ColorInputProperty(new Color(0xBCBCFF)); 

        super("Normal Map", Theme.config.groupVector, [
            
            new Output("Normal", 2),
            typeCombo, 
            strength,
            color
        ]);

        this.typeCombo = typeCombo;
        this.strength = strength;
        this.color = color; 
    }

    protected onTypeComboChange( type:number ) {
        this.update()
    }

    override writeScript(script: Script): string {
        // si es tangen space... usa el UV
        // else usa el object space o el world space tsl params
        let map = this.color.writeScript(script);
        let node = "";
        let strength = this.strength.value; 

        switch( this.typeCombo.index )
        { 
            case 1: //object space
                script.importModule("modelNormalMatrix");
                script.importModule("normalize");
                script.importModule("normalGeometry"); // Geometry normal in object space
                script.importModule("vec4"); 

                node = ` 
                    // object space normal map
                    const mappedNormal = ${map}.xyz.mul(2).sub(1);
                    const normalDiff = mappedNormal.sub(normalGeometry);
                    const adjustedNormal = normalGeometry.add(normalDiff.mul(${strength}));

                    return normalize(modelNormalMatrix.mul(vec4(adjustedNormal, 0)).xyz);
                `;
                break;

            case 2: // worlds space
                script.importModule("modelNormalMatrix");
                script.importModule("normalize");
                script.importModule("normalGeometry"); 
                script.importModule("vec4"); 

                node = `
                // world's space normal
                const mappedNormal = ${map}.xyz.mul(2).sub(1);
                const normalDiff = mappedNormal.sub(normalGeometry);
                const adjustedNormal = normalGeometry.add(normalDiff.mul(${strength}));

                return normalize((modelNormalMatrix.mul(vec4(adjustedNormal, 0))).xyz);
                `;

                break;

            default: // tangent space
                script.importModule("normalMap");
                script.importModule("TBNViewMatrix");
                script.importModule("normalGeometry");
                script.importModule("normalize");
 
                node = `
                    // tangent space normal
                    const mappedNormal = ${map}.xyz.mul(2).sub(1);
                    const normalDiff = mappedNormal.sub(normalGeometry);
                    const adjustedNormal = normalGeometry.add(normalDiff.mul(${strength}));

                    return normalize(TBNViewMatrix.mul(adjustedNormal));
                    //return normalMap( ${map} );
                `;
                break;
        }

        return script.define( this.nodeName, node, true );

    }
} 