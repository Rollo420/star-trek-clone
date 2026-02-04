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
    });
});
