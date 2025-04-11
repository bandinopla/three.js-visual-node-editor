import { NodeGroupType, NodeTypes } from '../EditorNodes';
import { Node } from '../nodes/Node';
import styles from './NodeSelectionModal.module.css';

type NodeHandler = (node: Node) => void;

class NodeSelector {
    private div: HTMLDivElement;
    private input: HTMLInputElement;
    private _onCreated?: NodeHandler;
    private onClosed?: VoidFunction;

    constructor() {
        this.div = document.createElement('div');
        this.div.classList.add(styles.root, styles.hide);
        document.body.appendChild(this.div);

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Find node by name...';

        this.div.appendChild(this.input);

        window.addEventListener('mousedown', (ev) => {
            if (this.visible) this.hide();
        });

        this.div.addEventListener('mousedown', (ev) => {
            ev.stopImmediatePropagation();
        });

        //
        // Autocomplete
        //
        let autocompleteIntrv = 0;
        this.input.addEventListener('keyup', (ev) => {
            clearInterval(autocompleteIntrv);
            autocompleteIntrv = setTimeout(() => this.filterList(), 300);
        });

        // render types!
        //#region Node Types
        NodeTypes.forEach((groupType) => {
            this.div.appendChild(this.renderGroup(groupType));
        });
        //#endregion
    }

    private renderGroup(groupType: NodeGroupType) {
        const ul = document.createElement('ul');
        const groupDiv = document.createElement('div');
        const title = groupDiv.appendChild(document.createElement('div'));

        title.innerText = groupType.group;
        title.style.backgroundColor = groupType.color;
        title.classList.add(styles.groupTitle);

        groupType.nodes
            .filter((node) => !node.hidden)
            .forEach((node) => {
                const li = ul.appendChild(document.createElement('li'));

                li.setAttribute('node-id', node.id);
                li.setAttribute('node-name', node.name);

                const groupLabel = li.appendChild(
                    document.createElement('div'),
                );
                const label = li.appendChild(document.createElement('span'));
                label.innerText = '→' + node.name;

                groupLabel.classList.add(styles.groupTitle);
                groupLabel.style.backgroundColor = groupType.color;
                groupLabel.innerText = groupType.group;

                li.addEventListener('click', (ev) => {
                    let instance: Node;

                    if (node.constructorArgs) {
                        instance = new node.TypeClass(
                            ...(Array.isArray(node.constructorArgs)
                                ? node.constructorArgs
                                : [node.constructorArgs]),
                        );
                    } else {
                        instance = new node.TypeClass();
                    }

                    node.onCreated?.(instance);
                    this.addNewNode(instance);
                });
            });

        groupDiv.classList.add(styles.group);
        groupDiv.appendChild(ul);

        return groupDiv;
    }

    get visible() {
        return !this.div.classList.contains(styles.hide);
    }

    private filterList() {
        const term = this.input.value.toLowerCase();
        const isEmpty = term === '';

        this.div.classList.remove(styles.term);

        if (!isEmpty) this.div.classList.add(styles.term);

        this.div.querySelectorAll('li').forEach((li) => {
            const match =
                isEmpty ||
                li.getAttribute('node-name')?.toLowerCase().includes(term);
            li.classList.remove(styles.hide);
            if (!match) {
                li.classList.add(styles.hide);
            }
        });
    }

    private addNewNode(node: Node) {
        this._onCreated?.(node);
        this.hide();
    }

    hide() {
        this.onClosed?.();
        this.onClosed = undefined;

        this.div.classList.add(styles.hide);
        this._onCreated = undefined;
    }

    show(
        posX: number,
        porY: number,
        onCreated: NodeHandler,
        customNodes?: NodeGroupType[],
    ) {
        this.div.classList.remove(styles.hide);
        this.div.style.left = `${posX - 20}px`;
        this.div.style.top = `${porY - 20}px`;

        const customs = customNodes?.map((cn) => this.renderGroup(cn));

        if (customs) {
            this.div.prepend(...customs);
            this.div.prepend(this.input);
            this.onClosed = () => customs.forEach((cn) => cn.remove());
        }

        this.input.value = '';
        this.input.focus();
        this.filterList();

        this._onCreated = onCreated;
    }
}

let modal: NodeSelector;

/**
 * Open the model to search and select the node you want to add
 * @param showModalAtX modal position x
 * @param showModalAtY modal position y
 * @param onCreated when the node is instantiated, this will be called
 * @param customNodes extra nodes can be passed here in case of a dynamic list of nodes should also be available
 */
export function createNewNode(
    showModalAtX: number,
    showModalAtY: number,
    onCreated: NodeHandler,
    customNodes?: NodeGroupType[],
) {
    if (!modal) modal = new NodeSelector();

    modal.show(showModalAtX, showModalAtY, onCreated, customNodes);
}
