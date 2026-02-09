document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hex-map-canvas');
    if (!canvas) return; // Abbruch, falls Canvas nicht existiert

    const container = document.getElementById('hex-map-container');
    const loadingIndicator = document.getElementById('map-loading');
    const ctx = canvas.getContext('2d', { alpha: false }); // Alpha false für Performance

    // Konfiguration
    const HEX_SIZE = 80; // Muss mit Python übereinstimmen
    // Breite eines Hexagons (flache Seite oben/unten bei Pointy Top oder umgekehrt, hier basierend auf Python Logik)
    // Python nutzt: x = scale * (sqrt(3)*r + sqrt(3)/2*q), y = scale * (3/2*q)
    // Das entspricht Pointy-Top Orientierung.
    const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE; 
    const HEX_HEIGHT = 2 * HEX_SIZE;

    // State
    let hexagons = [];
    let images = {}; // Image Cache
    let selectedHexId = null;
    
    // Kamera / Viewport
    let camera = { x: 0, y: 0, zoom: 0.5 }; // Start Zoom etwas weiter weg
    let isDragging = false;
    let lastMouse = { x: 0, y: 0 };

    // --- Initialisierung ---

    function resize() {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        requestAnimationFrame(draw);
    }
    window.addEventListener('resize', resize);
    resize();

    // Daten laden
    fetch('/karte/map-data-json/')
        .then(res => res.json())
        .then(data => {
            hexagons = data.hexagons;
            preloadImages(hexagons);
        })
        .catch(err => console.error("Fehler beim Laden der Karte:", err));

    function preloadImages(hexList) {
        const uniqueUrls = [...new Set(hexList.map(h => h.image_url).filter(u => u))];
        let loadedCount = 0;
        
        if (uniqueUrls.length === 0) {
            finishLoading();
            return;
        }

        uniqueUrls.forEach(url => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === uniqueUrls.length) finishLoading();
            };
            img.onerror = () => { // Auch bei Fehler weiterzählen
                loadedCount++;
                if (loadedCount === uniqueUrls.length) finishLoading();
            };
            images[url] = img;
        });
    }

    function finishLoading() {
        if(loadingIndicator) loadingIndicator.style.display = 'none';
        // Zentriere Kamera auf den ersten Sektor oder (0,0)
        if (hexagons.length > 0) {
            // Optional: Startposition setzen
        }
        requestAnimationFrame(draw);
    }

    // --- Rendering ---

    function drawHexagonPath(ctx, x, y, r) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            // Pointy Top: Winkel bei 30°, 90°, 150°... (in Radiant)
            const angle = (Math.PI / 3) * i + (Math.PI / 6);
            const px = x + r * Math.cos(angle);
            const py = y + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
    }

    function draw() {
        // Hintergrund
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        
        // Kamera Transformation
        // Wir verschieben den Ursprung in die Mitte des Canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camera.x, -camera.y);

        // Viewport Berechnung für Culling (nur sichtbare zeichnen)
        // Sichtbarer Bereich in Welt-Koordinaten berechnen
        const viewL = camera.x - (canvas.width / 2) / camera.zoom - HEX_SIZE;
        const viewR = camera.x + (canvas.width / 2) / camera.zoom + HEX_SIZE;
        const viewT = camera.y - (canvas.height / 2) / camera.zoom - HEX_SIZE;
        const viewB = camera.y + (canvas.height / 2) / camera.zoom + HEX_SIZE;

        hexagons.forEach(hex => {
            // Culling: Überspringen wenn außerhalb des Bildschirms
            if (hex.x < viewL || hex.x > viewR || hex.y < viewT || hex.y > viewB) return;

            // Bild zeichnen
            if (hex.image_url && images[hex.image_url]) {
                const size = HEX_WIDTH; // Annahme: Bilder sind quadratisch/passend
                // Zentriert zeichnen
                ctx.drawImage(images[hex.image_url], hex.x - size/2, hex.y - size/2, size, size);
            } else {
                // Fallback: Einfacher Kreis oder Hexagon wenn kein Bild
                drawHexagonPath(ctx, hex.x, hex.y, HEX_SIZE);
                ctx.lineWidth = 1 / camera.zoom; // Dünne Linie, skaliert mit Zoom
                ctx.strokeStyle = '#333';
                ctx.stroke();
            }

            // Selektion Highlight
            if (hex.id == selectedHexId) {
                drawHexagonPath(ctx, hex.x, hex.y, HEX_SIZE);
                ctx.lineWidth = 5 / camera.zoom; // Linie bleibt gleich dick egal wie der Zoom ist
                ctx.strokeStyle = '#00ff00';
                ctx.stroke();
            }
        });

        ctx.restore();
    }

    // --- Interaktion ---

    container.addEventListener('mousedown', e => {
        if (e.button !== 0) return; // Nur Linksklick
        isDragging = true;
        lastMouse = { x: e.clientX, y: e.clientY };
        container.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });

    container.addEventListener('mousemove', e => {
        if (isDragging) {
            const dx = e.clientX - lastMouse.x;
            const dy = e.clientY - lastMouse.y;
            lastMouse = { x: e.clientX, y: e.clientY };

            // Kamera bewegen (Gegenteil der Mausbewegung / Zoom berücksichtigen)
            camera.x -= dx / camera.zoom;
            camera.y -= dy / camera.zoom;
            
            requestAnimationFrame(draw);
        }
    });

    container.addEventListener('wheel', e => {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const direction = Math.sign(e.deltaY); // 1 = raus, -1 = rein
        const scaleFactor = Math.exp(direction * -zoomIntensity); // Negativ, damit Scrollen intuitiv ist
        
        const newZoom = Math.max(0.05, Math.min(5.0, camera.zoom * scaleFactor));
        
        // Optional: Zoom zur Mausposition (etwas komplexer, hier vereinfachtes Zoom zur Mitte)
        camera.zoom = newZoom;
        
        requestAnimationFrame(draw);
    }, { passive: false });

    container.addEventListener('click', e => {
        if (isDragging) return; // Nicht klicken wenn gezogen wurde

        // Mausposition im Canvas
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Umrechnung in Welt-Koordinaten
        const worldX = (mx - canvas.width / 2) / camera.zoom + camera.x;
        const worldY = (my - canvas.height / 2) / camera.zoom + camera.y;

        // Nächstes Hexagon finden (Hit Detection)
        // Bei 65k Elementen ist eine einfache Schleife in JS immer noch sehr schnell (<10ms)
        let closestHex = null;
        let minDistSq = Infinity;
        const radiusSq = (HEX_SIZE) * (HEX_SIZE); // Klick-Radius

        for (let i = 0; i < hexagons.length; i++) {
            const h = hexagons[i];
            const dx = h.x - worldX;
            const dy = h.y - worldY;
            const distSq = dx*dx + dy*dy;
            
            if (distSq < radiusSq && distSq < minDistSq) {
                minDistSq = distSq;
                closestHex = h;
            }
        }

        if (closestHex) {
            selectedHexId = closestHex.id;
            requestAnimationFrame(draw);
            
            // Event feuern wie im alten Code
            const event = new CustomEvent('sectorChanged', { detail: { sectorID: closestHex.id } });
            document.dispatchEvent(event);
        }
    });
});
