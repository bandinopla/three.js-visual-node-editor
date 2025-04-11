import { Theme } from '../../colors/Theme';
import { LayoutElement } from '../../layout/LayoutElement';
import { WinNode } from '../WinNode';

/**
 * Base for any node related to logic/programming
 */
export class BaseLogicNode extends WinNode {
    constructor(title: string, childs: LayoutElement[]) {
        super(title, Theme.config.groupLogic, childs);
    }
}
