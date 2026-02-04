document.addEventListener('sectorChanged', function (e) {
    const sectorID = e.detail.sectorID;
    updateFleetDetails(sectorID);
})

async function updateFleetDetails(id) {
    const container = document.getElementById('fleet-info');

    try {
        //fetch fleet infos from django backend 
        const response = await fetch(`/api/schiffe/${id}/`);
        console.log(response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fleet data:', data);
        
        // Hier kannst du die Daten im Container anzeigen
        container.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }
    catch (error) {
        console.error('Fleet-Info Error: ', error);
        container.innerHTML = '<p>Fehler beim Laden der Flottendaten</p>';
    }
}
