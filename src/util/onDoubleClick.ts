export function onDoubleClick( elem:HTMLElement , onClick:(ev:MouseEvent)=>void )
{
    let clickCount = 0;
    let clickTimer = 0;
    
    elem.addEventListener('click', (event) => {
      clickCount++;
    
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          // Single click action 
          clickCount = 0;
        }, 300); // Adjust the delay as needed (milliseconds)
      } else if (clickCount === 2) {
        clearTimeout(clickTimer);
        // Double click action
        onClick(event)
        clickCount = 0;
      }
    });
}