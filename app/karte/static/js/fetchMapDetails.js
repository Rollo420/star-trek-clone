document.addEventListener('sectorChanged', function (e) {
    const sectorID = e.detail.sectorID;
    updateMapDetails(sectorID);
})

async function updateMapDetails(id) {
    
    try {
        //fetch Map infos from django backend 
        // Lade Sektor-Details per AJAX und zeige im unteren Bereich
        fetch(`/karte/sector/${id}/json/`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) {
                    const planetBottom = document.getElementById('planet-detail-bottom');
                    if (planetBottom) {
                        planetBottom.innerHTML = data.html;
                        console.log(data.html);
                    }
                } else {
                    console.error('Fehler beim Laden der Sektordaten.');
                }
            })
            .catch(err => console.error('Netzwerkfehler:', err));

    }
    catch (error) {
        console.error('Map-Info Error: ', error);
    }
}

