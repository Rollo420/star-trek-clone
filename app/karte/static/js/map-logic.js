document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('hex-map');
    const selectionColor = '#00ff00';
    let selectedHex = null;

    // Delegiertes Event-Handling für große Maps
    svg.addEventListener('click', (e) => {
        const g = e.target.closest('.hex-group');
        if (!g) return;
        const id = g.dataset.id;

        // Optimierung: Nur das vorherige Hex zurücksetzen, nicht alle
        if (selectedHex && selectedHex !== g) {
            selectedHex.querySelector('.border').setAttribute('stroke', 'black');
            selectedHex.querySelectorAll('.side').forEach(side => {
                side.setAttribute('fill', side.dataset.color);
            });
        }

        // Highlight: aktives Hex
        g.querySelector('.border').setAttribute('stroke', selectionColor);
        selectedHex = g;

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
    });
});
