export function ImperiumModule(data) {
    if (!data || data.message) return '<p style="color: #ff3333; font-family: monospace;">[!] NO LIFE SIGNS DETECTED IN SECTOR</p>';

    let mainHtml = '<div class="tactical-display" style="font-family: \'Courier New\', Courier, monospace;">';
    Object.entries(data).forEach(([imperiumName, categories]) => {
        mainHtml += ImperiumCard(imperiumName, categories);
    });
    mainHtml += '</div>';
    return mainHtml;
}
function ImperiumCard(imperiumName, categories) {
    // Hier nutzen wir CSS-Clips für die schrägen Kanten (Polygon)
    return `
        <details class="level-imperium" style="margin-bottom: 25px; border: none; background: transparent; font-family: 'Share Tech Mono', 'Courier New', monospace;">
            <summary style="
                display: flex; 
                align-items: center; 
                cursor: pointer; 
                list-style: none;
                background: #f90; /* Star Trek Gold */
                color: #000;
                padding: 0;
                clip-path: polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%);
                height: 40px;
                position: relative;
            ">
                <div style="background: #000; color: #f90; padding: 0 15px; height: 100%; display: flex; align-items: center; font-weight: bold; margin-right: 15px;">
                    SEC-01
                </div>
                <span style="text-transform: uppercase; letter-spacing: 3px; font-weight: 900;">
                    ${imperiumName} // NET_AUTH_VERIFIED
                </span>
                <div style="margin-left: auto; margin-right: 60px; font-size: 0.8em; opacity: 0.7;">
                    SIG_STRENGTH: 98%
                </div>
            </summary>

            <div class="imperium-body" style="
                border-left: 15px solid #f90;
                margin-top: 5px;
                padding: 15px;
                background: rgba(255, 153, 0, 0.05);
                border-bottom: 2px solid #f90;
                border-radius: 0 0 0 20px;
            ">
                <div style="display: flex; gap: 20px; margin-bottom: 15px; font-size: 0.7em; color: #f90; text-transform: uppercase;">
                    <span>> STATUS: IN_ORBIT</span>
                    <span>> SENSORS: ACTIVE</span>
                    <span>> CATEGORIES: ${Object.keys(categories).length}</span>
                </div>
                
                ${FleetCards(categories)}
                
                <div style="text-align: right; font-size: 0.6em; color: #f90; margin-top: 10px; opacity: 0.5;">
                    SYSTEM_CORE_V.4.2.28
                </div>
            </div>
        </details>
    `;
}

function FleetCards(categories) {
    let html = '';
    Object.entries(categories).forEach(([catName, classes]) => {
        html += `
            <details class="level-category" style="margin: 8px 0 8px 10px; border-left: 2px solid #ffcc00;">
                <summary style="padding: 5px 10px; cursor: pointer; color: #ffcc00; font-size: 0.9em; text-transform: uppercase;">
                    > SUB-ROUTINE: ${catName}
                </summary>
                <div style="padding-left: 10px;">
                    ${ClassCards(classes)}
                </div>
            </details>
        `;
    });
    return html;
}

function ClassCards(classes) {
    let html = '';
    Object.entries(classes).forEach(([className, ships]) => {
        html += `
            <details class="level-class" style="margin: 5px 0 5px 15px; border-left: 1px dashed #00ff41;">
                <summary style="padding: 3px 10px; cursor: pointer; color: #00ff41; font-size: 0.85em;">
                    :: CLASS: ${className} [${ships.length} UNITS]
                </summary>
                <div style="padding: 5px 0;">
                    ${ships.map(ship => ShipEntry(ship)).join('')}
                </div>
            </details>
        `;
    });
    return html;
}

function ShipEntry(ship) {
    // Berechne Energie-Balken (Beispiel)
    const energy = ship.components.warpkern?.m_energie || 0;
    const shield = ship.components.schilde?.m_energie || 0;

    return `
        <div class="ship-unit" style="margin: 5px 0 5px 20px; padding: 10px; background: rgba(0, 255, 65, 0.05); border: 1px solid rgba(0, 255, 65, 0.3); position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #fff; font-weight: bold; font-size: 0.9em;">ID_${ship.id}: ${ship.name.toUpperCase()}</span>
                <span style="color: #00ff41; font-size: 0.7em;">[ STATUS: ACTIVE ]</span>
            </div>
            
            <div style="margin-top: 8px; font-size: 0.7em;">
                <div style="margin-bottom: 4px;">
                    PWR [${'|'.repeat(Math.min(energy / 10, 10))}${'.'.repeat(Math.max(0, 10 - energy / 10))}] ${energy}MW
                </div>
                <div>
                    SHD [${'|'.repeat(Math.min(shield / 10, 10))}${'.'.repeat(Math.max(0, 10 - shield / 10))}] ${shield}%
                </div>
            </div>
            
            <div style="position: absolute; bottom: 0; right: 0; width: 5px; height: 5px; border-right: 1px solid #00ff41; border-bottom: 1px solid #00ff41;"></div>
        </div>
    `;
}