export function createCheckerPattern(
    w: number,
    h: number,
    color1: string,
    color2: string,
): CanvasPattern {
    const canvas = document.createElement('canvas');
    canvas.width = w * 2;
    canvas.height = h * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return new OffscreenCanvas(1, 1)
            .getContext('2d')!
            .createPattern(document.createElement('canvas'), 'repeat')!;

    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, w, h);
    ctx.fillRect(w, h, w, h);

    ctx.fillStyle = color2;
    ctx.fillRect(w, 0, w, h);
    ctx.fillRect(0, h, w, h);

    const pattern = ctx.createPattern(canvas, 'repeat')!;

    // Cleanup
    canvas.remove();
    return pattern;
}
