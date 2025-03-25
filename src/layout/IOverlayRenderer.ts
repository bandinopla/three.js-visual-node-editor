import { LayoutElement } from "./LayoutElement";

export interface IOverlayRenderer {
    renderOverlay( ctx:CanvasRenderingContext2D ):void;
    get overlayBody():LayoutElement
}