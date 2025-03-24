import { ImageAtlas } from "../util/ImageAtlas";

const frames = {
    point: [0,0],
    click: [1, 0],
    grab: [2, 0],
    palm: [3, 0],
    reach: [4, 0]
};

type HandTypes = keyof typeof frames;

export class HandIcon extends ImageAtlas<HandTypes> {
    constructor() {
        super(import.meta.env.BASE_URL + 'icon/hand-icons.png', 32, 32, frames)
    }
}