document.addEventListener('sectorChanged', function(e){
    const sectorID =e.detail.sectorID;
    updateFleetDetails(sectorID);
})

async function updateFleetDetails(id) {
    const container = document.getElementById('fleet-info');

    try
    {
        //fetch fleet infos from django backend 

        // Lade Sektor-Details per AJAX und zeige im unteren Bereich
        fetch(`/karte/sector/${id}/json/`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) {
                    const planetBottom = document.getElementById('planet-detail-bottom');
                    if (planetBottom) {
                        planetBottom.innerHTML = data.html;
                    }
                } else {
                    console.error('Fehler beim Laden der Sektordaten.');
                }
            })
            .catch(err => console.error('Netzwerkfehler:', err));
    
    }
    catch (error)
    {
        console.error('Fleet-Info Error: ', error);
    }
}

