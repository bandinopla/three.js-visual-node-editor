import { Theme } from '../../colors/Theme';
import { DataType, IDataType } from '../../core/IOutlet';
import { Script } from '../../export/Script';
import { BasicInputProperty } from '../../properties/BasicInputProperty';
import { Output } from '../../properties/Output';
import { WinNode } from '../WinNode';

export class SpliNode extends WinNode {
    protected channels: Output[];
    protected source: BasicInputProperty; 

    constructor() {
        const props = "xyzw";
        const channels = Array.from({ length:4 }).map( (_,i)=>new Output(props[i], DataType.float, props[i]) );

        super('Split', Theme.config.groupMath, [
            new BasicInputProperty(DataType.wildcard, 'source'), 
            ...channels
        ]);

        this.source = this.getChildOfType(BasicInputProperty)!; 
        this.channels = channels;
    } 

    override width(ctx: CanvasRenderingContext2D): number {
        return super.width(ctx)/2
    }

    override get nodeDataType(): IDataType | undefined {  
        return this.source.type == DataType.wildcard? DataType.vec4 : this.source.type ;
    }

    override update(): void {
        const size = this.nodeDataType!.size;

        this.channels.forEach(( channel, i) => {
            channel.enabled = i < size;
        });

        super.update();
    }

    protected override writeNodeScript(script: Script): string { 
        return this.source.writeScript(script);
    } 
} 