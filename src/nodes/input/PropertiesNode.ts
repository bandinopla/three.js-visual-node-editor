import { Theme } from '../../colors/Theme';
import { DataTypes, IDataType } from '../../core/IOutlet';
import { Script } from '../../export/Script';
import { Output } from '../../properties/Output';
import { decamelcase } from '../../util/decamelcase';
import { WinNode } from '../WinNode';

type PropertyDef = {
    name: string;
    desc: string;
    type: string;
};

/**
 * This works hand in hand with `TslInputNode.ts` It was made to quickly create nodes...
 * An output that returns a standalone node from tsl, it doesn't read anything from it's owner node.
 */
class PropertyOutput extends Output {
    constructor(
        protected prop: PropertyDef,
        nameFormatter?: (name: string) => string,
    ) {
        const toSize = (s: string) =>
            s == 'float' ? 1 : Number(s.match(/\d+/)?.[0] ?? 0);

        const title = decamelcase(nameFormatter?.(prop.name) ?? prop.name);

        super(
            title == '' ? prop.name : title,
            DataTypes.find((dt) => dt.name == prop.type)!.type,
        );
    }

    override writeScript(script: Script): string {
        script.importModule(this.prop.name);
        return this.prop.name;
    }
}

/**
 * A shell node exposing standalone properties from tsl.
 */
export class PropertiesNode extends WinNode {
    constructor(
        title: string,
        props: PropertyDef[],
        nameFormatter?: (name: string) => string,
    ) {
        super(
            title,
            Theme.config.groupInput,
            props.map((prop) => new PropertyOutput(prop, nameFormatter)),
        );
    }

    override get nodeDataType(): IDataType | undefined {
        return;
    }
}
