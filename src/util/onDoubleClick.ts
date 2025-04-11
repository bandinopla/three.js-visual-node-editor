export function onDoubleClick(
    elem: HTMLElement,
    onClick: (ev: MouseEvent) => void,
) {
    let clickCount = 0;
    let clickTimer = 0;
    let clickX = 0;
    let clickY = 0;

    elem.addEventListener('click', (event) => {
        if (event.clientX == clickX && event.clientY == clickY) {
            clickCount++;
        } else {
            clickCount = 1;
        }

        clickX = event.clientX;
        clickY = event.clientY;

        if (clickCount === 1) {
            clickTimer = setTimeout(() => {
                // Single click action
                clickCount = 0;
            }, 300); // Adjust the delay as needed (milliseconds)
        } else if (clickCount === 2) {
            clearTimeout(clickTimer);
            // Double click action
            onClick(event);
            clickCount = 0;
        }
    });
}
