import { Theme } from '../../colors/Theme';
import { LayoutElement } from '../../layout/LayoutElement';
import { InputBaseNode } from '../input/InputBaseNode';
import { WinNode } from '../WinNode';

/**
 * Base class to every node in this category
 */
export class BaseAttributeNode extends InputBaseNode {
    constructor(childs: LayoutElement[]) {
        super('Attribute', childs);
    }
}
