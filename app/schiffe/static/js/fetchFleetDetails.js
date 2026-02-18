import { ImperiumModule } from "./fleetCards.js";

/**
 * Cinematic Floating Hologram - High Visibility Edition
 * Kompakter Kasten, zentriert, extrem große Schrift.
 */
function popupShipDetails(ship) {
    const existing = document.getElementById('holo-v8-overlay');
    if (existing) document.body.removeChild(existing);

    const overlay = document.createElement('div');
    overlay.id = 'holo-v8-overlay';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0, 5, 10, 0.6)', // Leicht transparent für den Floating-Effekt
        backdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: '10000', fontFamily: '"Share Tech Mono", monospace',
        perspective: '2000px'
    });

    const style = document.createElement("style");
    style.innerText = `
        @keyframes holo-appear {
            0% { transform: scale(0.8) translateZ(-200px); opacity: 0; }
            100% { transform: scale(1) translateZ(0); opacity: 1; }
        }
        .holo-panel {
            background: rgba(0, 40, 80, 0.7);
            border: 2px solid #00ccff;
            box-shadow: 0 0 40px rgba(0, 204, 255, 0.3);
            padding: 20px;
        }
        .data-label { color: #ff9900; font-size: 16px; text-transform: uppercase; font-weight: bold; }
        .data-value { color: #fff; font-size: 40px; text-shadow: 0 0 15px #00ccff; font-weight: bold; line-height: 1.1; }
        .mini-stat { background: rgba(0, 10, 20, 0.9); padding: 18px; border: 1px solid rgba(0, 204, 255, 0.4); }
        /* Scrollbar für das Hologramm */
        .scroll-area::-webkit-scrollbar { width: 8px; }
        .scroll-area::-webkit-scrollbar-thumb { background: #00ccff; border-radius: 4px; }
    `;
    document.head.appendChild(style);

    const board = document.createElement('div');
    Object.assign(board.style, {
        width: '1000px',
        height: '650px', // Begrenzte Höhe, damit es ein Kasten bleibt
        display: 'grid', gridTemplateColumns: '320px 1fr', gridTemplateRows: '110px 1fr 80px',
        gap: '20px', padding: '30px',
        background: 'rgba(0, 20, 40, 0.9)',
        border: '3px solid #00ccff',
        borderRadius: '15px',
        boxShadow: '0 0 80px rgba(0,0,0,0.8)',
        animation: 'holo-appear 0.5s ease-out',
        position: 'relative',
        transition: 'transform 0.1s ease-out'
    });

    const comps = ship.components;

    board.innerHTML = `
        <div class="holo-panel" style="grid-column: 1 / 3; display: flex; justify-content: space-between; align-items: center; border-left: 15px solid #00ccff;">
            <div>
                <span class="data-label">Tactical Feed</span>
                <div style="font-size: 45px; font-weight: bold; color: #fff; letter-spacing: 5px;">${ship.name.toUpperCase()}</div>
            </div>
            <div style="text-align: right;">
                <span class="data-label">Registry</span>
                <div style="font-size: 30px; color: #ff9900;">NCC-${ship.id}</div>
            </div>
        </div>

        <div class="holo-panel" style="display: flex; flex-direction: column; gap: 30px;">
            <div>
                <span class="data-label">Main Power</span>
                <div class="data-value">${comps.warpkern.m_energie}MW</div>
                <div style="height: 10px; background: #000; margin-top: 10px; border: 1px solid #00ccff;">
                    <div style="width: ${comps.warpkern.m_energie}%; height: 100%; background: #00ff88;"></div>
                </div>
            </div>
            <div>
                <span class="data-label">Shields</span>
                <div class="data-value">${comps.schilde.m_energie}%</div>
                <div style="height: 10px; background: #000; margin-top: 10px; border: 1px solid #ff9900;">
                    <div style="width: ${comps.schilde.m_energie}%; height: 100%; background: #ff9900;"></div>
                </div>
            </div>
            <div style="margin-top: auto; border-top: 2px solid #00ccff; padding-top: 15px;">
                <div class="data-label">Condition</div>
                <div style="color: #00ff88; font-size: 24px; font-weight: bold;">NOMINAL</div>
            </div>
        </div>

        <div class="holo-panel scroll-area" style="overflow-y: auto;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                ${Object.entries(comps).map(([name, data]) => `
                    <div class="mini-stat">
                        <div style="color: #00ccff; font-size: 20px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #00ccff;">
                            ${name.toUpperCase()}
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 16px; color: #fff;">
                            <div><span style="color:#ff9900; font-size: 11px;">NRG:</span> ${data.m_energie}</div>
                            <div><span style="color:#ff9900; font-size: 11px;">PRI:</span> ${data.m_abschaltpriro}</div>
                            <div><span style="color:#ff9900; font-size: 11px;">LIB:</span> ${data.m_modul_library}</div>
                            <div><span style="color:#ff9900; font-size: 11px;">DTH:</span> <span style="color:#ff3300;">${data.m_deathcount}</span></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="holo-panel" style="grid-column: 1 / 3; display: flex; justify-content: space-between; align-items: center; border-left: none; border-bottom: 8px solid #ff9900;">
            <div style="font-size: 14px; color: #00ccff; font-weight: bold;">
                SYS_ACTIVE // STARDATE: ${(47634.4 + Math.random()).toFixed(1)}
            </div>
            <button id="close-v8" style="
                background: #ff9900; border: none; color: #000;
                padding: 12px 50px; cursor: pointer; font-family: inherit; font-size: 20px;
                font-weight: bold; text-transform: uppercase; border-radius: 4px;
            ">Close</button>
        </div>
    `;

    overlay.appendChild(board);
    document.body.appendChild(overlay);

    const closeBtn = document.getElementById('close-v8');
    closeBtn.onclick = () => {
        board.style.transform = 'scale(0.8) translateY(50px)';
        board.style.opacity = '0';
        board.style.transition = '0.3s';
        setTimeout(() => document.body.removeChild(overlay), 300);
    };

    // Nur minimales Schweben
    overlay.onmousemove = (e) => {
        const x = (window.innerWidth / 2 - e.pageX) / 120;
        const y = (window.innerHeight / 2 - e.pageY) / 120;
        board.style.transform = `rotateX(${y}deg) rotateY(${x}deg)`;
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