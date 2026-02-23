
function toggleButtonMenu(button, targetId) {
    // 1. Alle map-info Elemente ausblenden
    document.querySelectorAll('.map-info').forEach(el => {
        el.style.display = 'none';
    });
    
    // 2. Den angeklickten Button hervorheben (aktiven Status setzen)
    document.querySelectorAll('.button-group .nav-btn').forEach(btn => {
        btn.classList.remove('active-tab-btn', 'btn-light');
        btn.classList.add('btn-dark');
    });
    
    // 3. Wenn targetId angegeben ist, das entsprechende Element einblenden
    if (targetId) {
        const target = document.getElementById(targetId);
        if (target) {
            target.style.display = 'block';
        }

        // Button Styling (Active State) - nur der geklickte Button wird aktiv
        button.classList.remove('btn-dark');
        button.classList.add('active-tab-btn');
    }
}

async function onSectorSelect(sectorID) {
    
    //Create a Custome Event
    const event = new CustomEvent('sectorChanged', {detail: {sectorID: sectorID}});

    document.dispatchEvent(event);
}