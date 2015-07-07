window.oncontextmenu = disableRightClick;

function disableRightClick(event)
{
    event.preventDefault();
    event.stopPropagation();
    return false;
}