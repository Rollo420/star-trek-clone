document.addEventListener('DOMContentLoaded', () => {
    // Variable, die das aktuell ausgewählte Sechseck speichert
    let selectedHex = null;

    // Wähle alle interaktiven Sechsecke aus
    const hexes = document.querySelectorAll('.hex-interactive');

    // Definiere die Farbe für die Auswahl
    const selectionColor = '#00ff00'; // Hellgrün

    hexes.forEach(hex => {
        hex.addEventListener('click', () => {
            // Wenn bereits ein Sechseck ausgewählt ist, setze seine Farben zurück
            if (selectedHex) {
                // Finde alle Segmente des vorherigen Sechsecks
                const oldSides = selectedHex.querySelectorAll('.side');
                oldSides.forEach(side => {
                    // Setze die Füllfarbe auf den ursprünglichen Wert aus data-color
                    side.style.fill = side.dataset.color;
                });
            }

            // Setze das neue Sechseck als ausgewählt
            selectedHex = hex;

            // Finde alle Segmente des neuen Sechsecks
            const newSides = selectedHex.querySelectorAll('.side');
            newSides.forEach(side => {
                // Setze die Füllfarbe auf die Auswahlfarbe
                side.style.fill = selectionColor;
            });
        });
    });
});