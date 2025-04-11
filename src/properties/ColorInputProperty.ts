import { Color } from 'three';
import { BaseColorProperty } from './BaseColorProperty';

export class ColorInputProperty extends BaseColorProperty {
    constructor(defaultColor: Color, title = 'Color') {
        super(title, defaultColor, false);
    }
}
