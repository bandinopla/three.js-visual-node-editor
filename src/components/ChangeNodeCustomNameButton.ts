import { FunctionNode } from '../nodes/logic/FunctionNode';
import { WinNode } from '../nodes/WinNode';
import { Button } from './Button';

export class ChangeNodeCustomNameButton extends Button {
    constructor(protected onNewGame?: (newName: string) => void) {
        super('name', () => this.changeName());
    }

    protected changeName() {
        const node = this.root as WinNode;

        let newName = prompt(
            'Set a new name...',
            node.customNodeName ?? node.nodeName,
        );

        if (!newName || newName.length == 0) return;

        if (this.onNewGame) {
            this.onNewGame(newName);
        }
        else {
            newName = (
                (this.root as WinNode).childOf as FunctionNode
            )?.getValidParameterName(newName);

            if (!newName) {
                return;
            }

            node.customNodeName = newName;
            node.update();
        }
    }
}
