
document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('hex-map');
    const selectionColor = '#00ff00';
    let selectedHex = null;

    // Sidebar-Container erzeugen, falls nicht vorhanden
    let sidebar = document.getElementById('sector-sidebar');
    if (!sidebar) {
        sidebar = document.createElement('div');
        sidebar.id = 'sector-sidebar';
        sidebar.className = 'sector-sidebar';
        document.body.appendChild(sidebar);
    }

    // Delegiertes Event-Handling für große Maps
    svg.addEventListener('click', (e) => {
        const g = e.target.closest('.hex-group');
        if (!g) return;
        const id = g.dataset.id;

        // Reset: alle Hexes auf Originalfarben
        document.querySelectorAll('.hex-group').forEach(hex => {
            hex.querySelector('.border').setAttribute('stroke', 'black');
            hex.querySelectorAll('.side').forEach(side => {
                side.setAttribute('fill', side.dataset.color);
            });
        });

        // Highlight: aktives Hex
        g.querySelector('.border').setAttribute('stroke', selectionColor);
        selectedHex = g;

        // Sektor-ID an Backend schicken (z.B. für Auswahl)
        fetch('/karte/select_sektor/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ sektor_id: id })
        });

        // Lade Sektor-Details per AJAX und zeige Sidebar
        fetch(`/karte/sector/${id}/json/`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) {
                    renderSectorSidebar(data);
                    // Planetendetails anzeigen, wenn Planeten vorhanden
                    const planetBottom = document.getElementById('planet-detail-bottom');
                    if (planetBottom) {
                        if (data.planets && data.planets.length > 0) {
                            let html = `<div class='planet-detail'><h5>Planetendetails</h5>`;
                            data.planets.forEach(p => {
                                html += `<div class='planet-box mb-3 p-2 border rounded bg-light d-flex flex-row align-items-center'>`;
                                if (data.sektorobjekt && data.sektorobjekt.image) {
                                    html += `<img src='${data.sektorobjekt.image}' style='height:64px;width:64px;margin-right:1em;' alt='Planet-Icon'/>`;
                                }
                                html += `<div class='planet-info text-start'>`;
                                html += `<strong>${p.m_name}</strong> <span class='text-muted'>(${p.m_klasse} ${p.m_typ||''})</span><br>`;
                                html += `<small>Besitzer: ${p.m_besitzer||'-'}</small><br>`;
                                html += `<small>Heimatplanet: ${p.m_heimatplanet ? 'Ja' : 'Nein'}</small><br>`;
                                html += `<small>Bevölkerung: ${p.m_bevoelkerung||'-'}</small><br>`;
                                html += `<small>Anbauzone: ${p.m_anbauzone||'-'}</small>`;
                                html += `</div></div>`;
                            });
                            html += `</div>`;
                            planetBottom.innerHTML = html;
                        } else {
                            planetBottom.innerHTML = '';
                        }
                    }
                } else {
                    sidebar.innerHTML = '<div class="p-3">Fehler beim Laden der Sektordaten.</div>';
                }
                sidebar.style.display = 'block';
            });
    });

    // Hilfsfunktion für CSRF-Token
    function getCSRFToken() {
        const name = 'csrftoken';
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const c = cookies[i].trim();
            if (c.startsWith(name + '=')) {
                return c.substring(name.length + 1, c.length);
            }
        }
        return '';
    }

    // Sidebar-Renderfunktion
    function renderSectorSidebar(data) {
        let html = `<div class="sidebar-header"><strong>Sektor</strong> (${data.label}) <button id="close-sidebar" class="btn btn-sm btn-secondary float-end">×</button></div>`;
        html += `<div class="sidebar-content">`;
        // Planeten
        html += `<details open><summary>Planeten (${data.planets.length})</summary><ul class="sidebar-list">`;
        data.planets.forEach(p => {
            html += `<li><strong>${p.m_name}</strong> <span class="text-muted">[${p.m_klasse} ${p.m_typ||''}]</span>${p.m_heimatplanet ? ' <span title="Heimatplanet">🏠</span>' : ''}`;
            if (p.m_besitzer) html += `<br><small>Besitzer: ${p.m_besitzer}</small>`;
            html += `</li>`;
        });
        html += `</ul></details>`;
        // Schiffe
        html += `<details><summary>Schiffe (${data.ships.length})</summary><ul class="sidebar-list">`;
        data.ships.forEach(s => {
            html += `<li><strong>${s.name}</strong> <span class="text-muted">[${s.klasse||''} ${s.klasse_typ||''}]</span>`;
            if (s.imperium) html += `<br><small>Imperium: ${s.imperium}</small>`;
            if (s.flotte) html += `, Flotte: ${s.flotte}`;
            html += `</li>`;
        });
        html += `</ul></details>`;
        // Sektorobjekt
        if (data.sektorobjekt) {
            html += `<details><summary>Sektorobjekt</summary><ul class="sidebar-list">`;
            html += `<li>Art: ${data.sektorobjekt.m_art} <img src="${data.sektorobjekt.image}" height="24"/></li>`;
            html += `</ul></details>`;
        }
        // Subraumenergie
        html += `<details><summary>Subraumenergie</summary><ul class="sidebar-list">`;
        html += `<li>${data.subraumenergielevel}</li>`;
        html += `</ul></details>`;
        html += `</div>`;
        sidebar.innerHTML = html;
        document.getElementById('close-sidebar').onclick = () => sidebar.style.display = 'none';
    }
});