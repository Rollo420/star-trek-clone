// fleetCards.js
let html = ''
export function ImperiumModule(data) {
   Object.entries(data).forEach(([imperiumName, categories]) => {
       html += `<div style="border: 1px solid #555; margin: 10px; padding: 10px;">`;
       html += `<h2>Imperium: ${imperiumName}</h2>`;

       Object.entries(categories).forEach(([categories, müll]) => {
           html += `<div style="border: 1px solid #555; margin: 10px; padding: 10px;">`;
           html += `<h2>Imperium: ${categories}</h2>`;
       });
   });

   return html;
}

function ImperiumCard(imperiumName, categories) {
    return `
        <div class="imperium-card" style="border: 2px solid #007bff; padding: 15px; border-radius: 8px; background: #222; color: white;">
            <h2 style="margin-top: 0; color: #007bff;">${imperiumName}</h2>
            <p>Anzahl Schiffskategorien: ${Object.keys(categories).length}</p>
            ${FleetCards(categories)}
            <div class="status-badge">📡 Sektor-Scan aktiv</div>
        </div>
    `;
}

function FleetCards(categories) {
    let html = '';
    
    for (const [categoryName, ships] of Object.entries(categories)) {
        html += `
            <div class="fleet-category mt-3">
                <h4 style="color: #17a2b8;">${categoryName}</h4>
                <div class="ship-list">
        `;
        
        for (const ship of ships) {
            html += `
                <div class="ship-card" style="background: #333; padding: 8px; margin: 5px 0; border-radius: 4px;">
                    <strong>${ship.name || 'Unbekannt'}</strong>
                    <br><small class="text-muted">Klasse: ${ship.schiffsklasse || 'N/A'}</small>
                    <br><small class="text-muted">Stärke: ${ship.staerke || 0}</small>
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
    }
    
    return html;
}
