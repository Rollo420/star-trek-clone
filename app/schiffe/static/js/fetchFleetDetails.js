import { ImperiumModule } from "./fleetCards.js";

document.addEventListener('sectorChanged', function (e) {
    const sectorID = e.detail.sectorID;
    updateFleetDetails(252);
})

async function updateFleetDetails(id) {
    const container = document.getElementById('fleet-info');
    if (!container) {
        console.error("Fehler: Container 'fleet-info' nicht im HTML gefunden!");
        return;
    }

    // Feedback für den User
    container.innerHTML = '<p>Lade Flottendaten...</p>';

    try {
        const response = await fetch(`/api/schiffe/${id}/`);
        if (!response.ok) throw new Error(`HTTP Fehler: ${response.status}`);

        const data = await response.json();

        // WICHTIG: Wenn das Backend ein leeres Objekt {} schickt, zeige das an
        if (Object.keys(data).length === 0 || data.message === 'no ships') {
            container.innerHTML = '<p>Keine Schiffe in diesem Sektor.</p>';
            return;
        }

        try{

            container.innerHTML = ImperiumModule(data);

        }
        catch (error)
        {
            container.innerHTML = '<p style="color: red;">Module konnte nciht geladen werden.</p>'  
        }

    } catch (error) {
        console.error('Fleet-Info Error: ', error);
        container.innerHTML = '<p style="color: red;">Fehler beim Laden.</p>';
    }
}