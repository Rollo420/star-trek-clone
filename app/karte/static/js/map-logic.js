document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('hex-map');
    const wrapper = document.getElementById('hex-map-scroll');
    const selectionColor = '#00ff00';
    let selectedHex = null;

    // Variablen für Drag & Drop (Panning)
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let scrollLeftStart = 0;
    let scrollTopStart = 0;
    let rafId = null;

    // Initialisierung: SVG auf Startgröße setzen, damit Scrollen funktioniert
    const baseWidth = svg.viewBox.baseVal.width;
    const baseHeight = svg.viewBox.baseVal.height;
    let currentScale = 1.0;
    
    svg.style.width = `${baseWidth}px`;
    svg.style.height = `${baseHeight}px`;

    wrapper.addEventListener('mousedown', e => {
        if(e.button !== 0) return; // Nur Linksklick
        isDragging = true;
        wrapper.style.cursor = 'grabbing';
        startX = e.clientX;
        startY = e.clientY;
        scrollLeftStart = wrapper.scrollLeft;
        scrollTopStart = wrapper.scrollTop;
    });

    wrapper.addEventListener('mouseup', () => {
        isDragging = false;
        wrapper.style.cursor = 'grab';
    });

    wrapper.addEventListener('mouseleave', () => {
        isDragging = false;
        wrapper.style.cursor = 'grab';
    });

    wrapper.addEventListener('mousemove', e => {
        if(!isDragging) return;
        e.preventDefault();
        
        // Performance: Nutzung von requestAnimationFrame verhindert Ruckeln
        if (!rafId) {
            rafId = requestAnimationFrame(() => {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                wrapper.scrollLeft = scrollLeftStart - dx;
                wrapper.scrollTop = scrollTopStart - dy;
                rafId = null;
            });
        }
    });

    // Zoom-Logik (Mausrad)
    wrapper.addEventListener('wheel', e => {
        e.preventDefault();

        
        const zoomIntensity = 0.1;
        const direction = Math.sign(e.deltaY); // 1 = raus, -1 = rein
        
        // Berechne neuen Zoom-Faktor
        const scaleFactor = Math.exp(direction * zoomIntensity);
        let newScale = currentScale / scaleFactor; // Umgekehrte Logik für intuitives Mausrad
        
        // Begrenzung (Min / Max Zoom)
        const minZoom = 0.2; // Minimaler Zoom (z.B. 0.2 = 20%)
        const maxZoom = 5.0; // Maximaler Zoom (z.B. 5.0 = 500%)
        newScale = Math.max(minZoom, Math.min(maxZoom, newScale));
        
        console.log("Aktueller Zoom:", newScale.toFixed(2));

        // Mausposition relativ zum Wrapper
        const rect = wrapper.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Mausposition relativ zum Inhalt (vor dem Zoom)
        const contentMouseX = mouseX + wrapper.scrollLeft;
        const contentMouseY = mouseY + wrapper.scrollTop;

        // Neue Größe anwenden
        currentScale = newScale;
        svg.style.width = (baseWidth * currentScale) + 'px';
        svg.style.height = (baseHeight * currentScale) + 'px';

        // Scroll-Position anpassen, um zur Maus zu zoomen
        wrapper.scrollLeft = (contentMouseX * (1 / scaleFactor)) - mouseX;
        wrapper.scrollTop = (contentMouseY * (1 / scaleFactor)) - mouseY;
    }, { passive: false });

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
