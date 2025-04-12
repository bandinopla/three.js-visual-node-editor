import { Theme } from '../../colors/Theme';
import { TextLabel } from '../../components/TextLabel';
import { DataType, DataTypes, IDataType, IOutlet } from '../../core/IOutlet';
import { Script } from '../../export/Script';
import { LayoutElement } from '../../layout/LayoutElement';
import { InputOrValue } from '../../properties/InputOrValue';
import { OutletProperty } from '../../properties/OutletProperty';
import { Output } from '../../properties/Output';
import { WinNode } from '../WinNode';
import { MathOpDef, MathOpParam } from './list';

const compatibleTypes = (
    mathTypes: MathOpParam[],
    strict = false,
): IDataType[] =>
    mathTypes.flatMap((mathType) =>
        DataTypes.filter((dataType) =>
            mathType.isCompatible(dataType.type, strict),
        ).map((d) => d.type),
    );

export class MathOperatorNode extends WinNode {
    protected T?: MathInput;
    protected operands?: MathInput[];

    protected output: Output;

    constructor(protected config: MathOpDef) {
        const childs: MathInput[] = [];

        if (config.params) {
            //inputProperty = new MathInput( config.params[0].name, config.params[0].type );

            config.params.forEach((param, i) => {
                childs.push(
                    new MathInput(
                        param.name,
                        param.type,
                        param.type[0].typeId == 'T'
                            ? (childs[0] as MathInput)
                            : undefined,
                    ),
                );
            });
        }

        super(config.fnName, Theme.config.groupMath, [
            ...childs,
            new Output('output', DataType.wildcard),
        ]);

        this.T = childs[0];
        this.operands = childs;

        this.output = this.getChildOfType(Output)!;

        this.output.type = this.nodeDataType!;
    }

    override width(ctx: CanvasRenderingContext2D): number {
        return super.width(ctx) / 2;
    }

    /**
     * by default we are a float
     */
    override get nodeDataType(): IDataType | undefined {
        const mathReturnType = this.config.returns[0];

        if (mathReturnType.typeId == 'T') {
            return this.T!.type;
        }

        let returns = compatibleTypes(this.config.returns, true);

        //
        // auto resize only if the type we are supposed to return allows growing...
        //
        if (
            !mathReturnType.size &&
            mathReturnType.typeId.includes('vec') &&
            this.T?.type.size
        ) {
            returns = returns.filter((r) => r.size == this.T!.type.size);
        }

        return returns[0];
    }

    override update(): void {
        if (this.T && !this.T.connectedTo) {
            if (this.operands?.[1]?.connectedTo) {
                //if( this.config.params![1].type[0].typeId=="T" )

                this.T.type = this.operands[1].type;
            } else if (this.T.type.size > 0) {
                this.T.updateType();
            }
        }

        super.update();
    }

    protected override writeNodeScript(script: Script): string {
        const fname = this.config.fnName;

        script.importModule(fname.replace('.', ''));

        if (!this.config.params) return fname; // it is a constant value.

        const operands = this.operands!.map((inputParam) =>
            inputParam.writeScript(script),
        );
        let output = '';

        if (fname.startsWith('.')) {
            output = `${operands[0] + fname}( ${operands.filter((_, i) => i > 0).join(',')} )`;
        } else {
            output = `${fname}(${operands.join(',')})`;
        }

        console.log('MATH NODE OUTPUT:', output);

        return script.define(this.nodeName, output);
    }

    override serialize(): Record<string, any> {
        return {
            operands: this.operands?.map( op=>op.value ),
            ...super.serialize()
        }
    }

    override unserialize(data: Record<string, any>): void {
        super.unserialize( data );
        data.operands?.forEach( (val:number, i:number )=> {
            this.operands![i].value = val;
        });
       
    }
}

/**
 * Math input for a math node.
 */
class MathInput extends InputOrValue {
    constructor(
        name: string,
        protected accepts: MathOpParam[],
        protected copyTypeOf?: MathInput,
    ) {
        const isLerp = accepts[0].typeId == 'lerpFactor';

        super(
            isLerp
                ? {
                      label: name,
                      asBar: true,
                      min: 0,
                      max: 1,
                  }
                : name,
        );

        const types = compatibleTypes(accepts); // accepts.flatMap( mathType=>DataTypes.filter( dataType=>mathType.isCompatible(dataType.type) ).map(d=>d.type) )

        const type: IDataType =
            accepts[0].typeId == '*' ? DataType.wildcard : types[0];

        if (copyTypeOf) {
            copyTypeOf.addEventListener(
                'typeChange',
                (ev) => (this.type = ev.newType),
            );
            this.type = copyTypeOf.type;
        } else {
            this.type = type;
        }

        this.multiplyInputWithValue = false;

        //
        // we, by default, have a UI to input a float, if it doesn't support one, don't show it...
        //
        if (!this.acceptsThisType(DataType.float)) {
            this.notConnectedContent = undefined;
            this.layout = undefined;
        }
    }

    protected acceptsThisType(type: IDataType) {
        return this.accepts.some((mathType) => mathType.isCompatible(type));
    }

    override isCompatible(other: IOutlet): boolean {
        return this.acceptsThisType(other.type);
    }

    override updateType(): void {
        //
        // if we copy and the outlet is connected
        //
        if (this.copyTypeOf && this.copyTypeOf.connectedTo) {
            this.type = this.copyTypeOf.type;
            return;
        }

        //
        // else, the default is to copy the type of the input
        //
        super.updateType();
    }
}
