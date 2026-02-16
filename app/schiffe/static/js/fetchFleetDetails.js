import { ImperiumModule } from "./fleetCards.js";

function popupShipDetails(ship) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#000';
    modalContent.style.border = '2px solid #f90';
    modalContent.style.borderRadius = '10px';
    modalContent.style.padding = '20px';
    modalContent.style.maxWidth = '400px';
    modalContent.style.width = '90%';
    modalContent.style.color = '#fff';
    modalContent.style.fontFamily = 'Courier New, monospace';

    // Modal header
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.marginBottom = '20px';
    header.innerHTML = '<h2 style="color: #f90; margin: 0;">SHIP DETAILS</h2>';

    // Display-only content
    const details = document.createElement('div');
    details.innerHTML = `
        <p style="margin-bottom: 10px;"><span style="color: #00ff41;">Name:</span> ${ship.name}</p>
        <p style="margin-bottom: 10px;"><span style="color: #00ff41;">ID:</span> ${ship.id}</p>
        <p style="margin-bottom: 10px;"><span style="color: #00ff41;">Energy:</span> ${ship.components.warpkern?.m_energie || 0} MW</p>
        <p style="margin-bottom: 20px;"><span style="color: #00ff41;">Shield:</span> ${ship.components.schilde?.m_energie || 0}%</p>
    `;

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'CLOSE';
    closeBtn.style.backgroundColor = '#f90';
    closeBtn.style.border = 'none';
    closeBtn.style.color = '#000';
    closeBtn.style.padding = '10px 20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.width = '100%';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.onclick = function() {
        document.body.removeChild(modal);
    };

    // Assemble modal
    modalContent.appendChild(header);
    modalContent.appendChild(details);
    modalContent.appendChild(closeBtn);
    modal.appendChild(modalContent);

    // Add to body
    document.body.appendChild(modal);

    // Close on overlay click
    modal.onclick = function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

document.addEventListener('sectorChanged', function (e) {
    const sectorID = e.detail.sectorID;
    
    updateFleetDetails(sectorID);
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

            // Add event listener for custom shipClick event
            container.addEventListener('shipClick', function(e) {
                popupShipDetails(e.detail);
            });

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