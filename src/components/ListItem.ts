import { Theme } from '../colors/Theme';
import { InteractiveLayoutElement } from '../layout/InteractiveLayoutElement';

export class ListItem extends InteractiveLayoutElement {
    private _selected = false;
    get selected() {
        return this._selected;
    }
    set selected(yep: boolean) {
        this._selected = yep;
        this.backgroundColor = yep
            ? Theme.config.comboSelectedItemBgColor
            : undefined;
        this.fontColor = yep
            ? Theme.config.comboSelectedItemTextColor
            : Theme.config.comboboxTextColor;
    }

    constructor(
        protected label: string,
        protected isHeader: boolean = false,
        protected onClick?: VoidFunction,
        protected onScroll?: (deltaY: number) => void,
    ) {
        super();
        this.isLocked = isHeader;
        this.xPadding = 5;
    }

    override renderContents(
        ctx: CanvasRenderingContext2D,
        maxWidth: number,
        maxHeight: number,
    ): void {
        this.writeText(
            ctx,
            this.label,
            this.fontSize * 0.8 * (this.isHeader ? 0.8 : 1),
            0,
            maxHeight,
            this.fontColor,
        );
    }

    override onMouseDown(cursorX: number, cursorY: number): void {
        this.onClick?.();
    }

    override onMouseWheel(deltaY: number): void {
        this.onScroll?.(deltaY);
    }
}
