document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('hex-map');
    const selectionColor = '#00ff00';
    let selectedHex = null;

    // Cache für planet images per sektor
    const planetImageCache = {};

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

        // Lade Sektor-Details per AJAX und zeige im unteren Bereich
        fetch(`/karte/sector/${id}/json/`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) {
                    const planetBottom = document.getElementById('planet-detail-bottom');
                    if (planetBottom) {
                        planetBottom.innerHTML = data.html;

                        // Bilder im Cache speichern, damit sie bei erneutem Klick nicht neu geladen werden
                        if (!planetImageCache[id]) {
                            const imgs = planetBottom.querySelectorAll('.planet-image');
                            planetImageCache[id] = [];
                            imgs.forEach(img => {
                                planetImageCache[id].push(img.src);
                            });
                        } else {
                            // Bilder aus Cache wiederherstellen
                            const imgs = planetBottom.querySelectorAll('.planet-image');
                            imgs.forEach((img, idx) => {
                                if (planetImageCache[id][idx]) {
                                    img.src = planetImageCache[id][idx];
                                }
                            });
                        }
                    }
                } else {
                    console.error('Fehler beim Laden der Sektordaten.');
                }
            });
    });
});
