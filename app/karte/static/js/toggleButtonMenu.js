
function toggleButtonMenu(button, targetId) {
    // 1. Alle map-info Elemente ausblenden
    document.querySelectorAll('.map-info').forEach(el => {
        el.style.display = 'none';
    });
    
    // 2. Den angeklickten Button hervorheben (aktiven Status setzen)
    document.querySelectorAll('.button-menu .btn').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-dark');
    });
    button.classList.remove('btn-dark');
    button.classList.add('btn-primary');
    
    // 3. Wenn targetId angegeben ist, das entsprechende Element einblenden
    if (targetId) {
        const target = document.getElementById(targetId);
        if (target) {
            target.style.display = 'block';
        }
    }
}
