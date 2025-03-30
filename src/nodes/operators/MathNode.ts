 
import { Theme } from "../../colors/Theme";
import { ComboBox } from "../../components/ComboBox";
import { Script } from "../../export/Script";
import { InputOrValue } from "../../properties/InputOrValue";
import { Output } from "../../properties/Output";
import { WinNode } from "../WinNode";

type Operator = [ symbol:string, tslMethod:string ];

export class MathNode extends WinNode {
    protected operators: Operator[];
    protected A:InputOrValue;
    protected B:InputOrValue;
    protected combo:ComboBox;

    constructor() {

        const operators : Operator[] = [
            ["+","add"],
            ["-","sub"],
            ["*","mul"],
            ["/","div"],
            ["%","mod"],
            ["==","equal"],
            ["!=","notEqual"]
            // TODO: Add more....
        ]

        super("Math Operator", Theme.config.groupMath, [
            new Output("Result", 0),
            new InputOrValue(0, "A", ()=>this.update()),
            new ComboBox("Operator", operators.map(o=>o[0]), i=>this.onComboChange(i)),
            new InputOrValue(0, "B", ()=>this.update()),
        ]);

        this.A = this.getChildOfType(InputOrValue,0)!;
        this.B = this.getChildOfType(InputOrValue,1)!;
        this.combo = this.getChildOfType(ComboBox)!; 

        this.operators = operators;

        this.onComboChange(0)
    }

    protected onComboChange( newIndex:number ) 
    {
        const op = this.operators[newIndex];

        this.setTitle( `.${op[1]}  A ${op[0]} B` );

        this.update();
    }

    override writeScript(script: Script): string { 

        const a = this.A.writeScript(script);
        const b = this.B.writeScript(script);

        const op = this.operators[this.combo.index][1];

        console.log(  `${a}.${op}(${b})`)

        return script.define( this.nodeName, `${a}.${op}(${b})`);
    }

    override serialize(): Record<string, any> {
        return {
            ...super.serialize(),
            a: this.A.value,
            b: this.B.value,
            op: this.combo.index
        }
    }

    override unserialize(data: Record<string, any>): void {
        super.unserialize(data);

        this.A.value = data.a ?? 0;
        this.B.value = data.b ?? 0;
        this.combo.index = data.op ?? 0;
    }
}