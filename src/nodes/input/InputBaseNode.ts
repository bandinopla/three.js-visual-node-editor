import { Theme } from '../../colors/Theme';
import { LayoutElement } from '../../layout/LayoutElement';
import { WinNode } from '../WinNode';

export class InputBaseNode extends WinNode {
    constructor(title: string, childs: LayoutElement[]) {
        super(title, Theme.config.groupInput, childs);
    }
}
