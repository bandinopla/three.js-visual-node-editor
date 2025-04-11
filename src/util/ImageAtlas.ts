export class ImageAtlas<T extends string> {
    private img: HTMLImageElement;

    constructor(
        path: string,
        protected frameWidth: number,
        protected frameHeight: number,
        protected sprites: { [key in T]: number[] },
    ) {
        this.img = new Image();
        this.img.src = path;

        this.img.onload = () => {
            console.log('ICONS ATLAS LOADED!', this.img);
        };
    }

    drawSprite(ctx: CanvasRenderingContext2D, id: T) {
        const [x, y] = this.sprites[id];

        ctx.drawImage(
            this.img,
            x * this.frameWidth,
            y * this.frameHeight,
            this.frameWidth,
            this.frameHeight,
            -this.frameWidth / 2,
            -this.frameHeight / 2,
            this.frameWidth,
            this.frameHeight,
        );
    }
}
