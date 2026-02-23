document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Starting map initialization');
    
    const canvas = document.getElementById('hex-map-canvas');
    const container = document.getElementById('hex-map-container');
    
    console.log('Canvas elements found:', {
        canvas: !!canvas,
        container: !!container
    });
    
    if (!canvas || !container) {
        console.error('Canvas or container not found');
        return;
    }
    
    const loadingIndicator = document.getElementById('map-loading');
    const ctx = canvas.getContext('2d', { alpha: false });

    // Minimap / Searchbar
    const minimapCanvas = document.getElementById('minimap-canvas');
    const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;

    //clickbare Minimap mit 0.20x zoom
    if (minimapCanvas) {
        minimapCanvas.addEventListener('click', e => {
            if (mapBounds.width === 0) return;

            const rect = minimapCanvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            // Konvertiere Minimap-Koordinaten in Welt-Koordinaten
            const scale = Math.min(minimapCanvas.width / mapBounds.width, minimapCanvas.height / mapBounds.height);
            const offsetX = (minimapCanvas.width - mapBounds.width * scale) / 2;
            const offsetY = (minimapCanvas.height - mapBounds.height * scale) / 2;

            const worldX = (clickX - offsetX) / scale + mapBounds.minX;
            const worldY = (clickY - offsetY) / scale + mapBounds.minY;

            // Springe mit der Kamera zur neuen Position, wie bei der Suche
            camera.x = worldX;
            camera.y = worldY;
            camera.zoom = 0.2;

            constrainCamera();
            requestAnimationFrame(draw);
        });
    }
    
    const minimapViewport = document.getElementById('minimap-viewport');
    const zoomDisplay = document.getElementById('zoom-level-display');
    const searchInput = document.getElementById('map-search-input');
    const searchResultsContainer = document.getElementById('search-results');
    let mapBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };

    // Konfiguration
    const HEX_SIZE = 80; 
    const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE; 
    const HEX_HEIGHT = 2 * HEX_SIZE;

    // Performance: einmalige Eckenberechnung
    const HEX_CORNERS = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + (Math.PI / 6);
        HEX_CORNERS.push({ x: Math.cos(angle), y: Math.sin(angle) });
    }

    // State
    let hexagons = [];
    let images = {}; // Image Cache
    let selectedHexId = null;
    let camera = { x: 0, y: 0, zoom: 0.5 }; 
    let isDragging = false;
    let lastMouse = { x: 0, y: 0 };

    // Initialisierung 

    function constrainCamera() {
        if (mapBounds.width <= 0 || mapBounds.height <= 0) 
            return;

        const viewW = canvas.width / camera.zoom;
        const viewH = canvas.height / camera.zoom;

        if (viewW >= mapBounds.width) {
            camera.x = mapBounds.minX + mapBounds.width / 2;
        } 
        else 
            {
            const minCamX = mapBounds.minX + viewW / 2;
            const maxCamX = mapBounds.maxX - viewW / 2;
            camera.x = Math.max(minCamX, Math.min(maxCamX, camera.x));
        }

        if (viewH >= mapBounds.height) {
            camera.y = mapBounds.minY + mapBounds.height / 2;
        } else {
            const minCamY = mapBounds.minY + viewH / 2;
            const maxCamY = mapBounds.maxY - viewH / 2;
            camera.y = Math.max(minCamY, Math.min(maxCamY, camera.y));
        }
    }

    function resize() {
        if (canvas && container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }
        setupMinimap(); 
        constrainCamera();
        requestAnimationFrame(draw);
    }
    window.addEventListener('resize', resize);
    
    setupSearch();
    fetch('/karte/map-data-json/')
        .then(res => res.json())
        .then(data => {
            hexagons = data.hexagons;
            preloadImages(hexagons);
        })
        .catch(err => console.error("Fehler beim Laden der Karte:", err));
    
    // Initial resize and draw after DOM is fully ready
    setTimeout(() => {
        resize();
    }, 200);

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
        if(loadingIndicator) 
            loadingIndicator.style.display = 'none';
        calculateMapBounds();
        setupMinimap();
        constrainCamera();
        requestAnimationFrame(draw);
    }

    function calculateMapBounds() {
        if (hexagons.length === 0) {
            if(loadingIndicator) 
                loadingIndicator.style.display = 'none';
            return;
        }
        
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        
        for (const h of hexagons) {
            if (h.x < minX) minX = h.x;
            if (h.x > maxX) maxX = h.x;
            if (h.y < minY) minY = h.y;
            if (h.y > maxY) maxY = h.y;
        }

        const padX = HEX_WIDTH / 2;
        const padY = HEX_HEIGHT / 2;

        mapBounds.minX = minX - padX;
        mapBounds.maxX = maxX + padX;
        mapBounds.minY = minY - padY;
        mapBounds.maxY = maxY + padY;
        mapBounds.width = mapBounds.maxX - mapBounds.minX;
        mapBounds.height = mapBounds.maxY - mapBounds.minY;
    }

    function setupMinimap() {
        if (!minimapCanvas || !minimapCtx) 
            return;
        
        const minimapContainer = minimapCanvas.parentElement;

        if (mapBounds.width > 0 && mapBounds.height > 0 && minimapContainer) {
            const width = minimapContainer.clientWidth;
            const ratio = mapBounds.height / mapBounds.width;
            const newHeight = width * ratio;
            
            minimapContainer.style.height = `${newHeight}px`;
            minimapContainer.style.aspectRatio = 'auto';
            
            minimapCanvas.width = width;
            minimapCanvas.height = newHeight;
        } else {
            minimapCanvas.width = container.clientWidth;
            minimapCanvas.height = container.clientHeight;
        }
        
        drawMinimapBackground();
    }

    function drawMinimapBackground() {
        if (!minimapCtx || mapBounds.width === 0) 
            return;
        
        //minimapCtx.fillStyle = '#111';
        minimapCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
        
        const scale = Math.min(minimapCanvas.width / mapBounds.width, minimapCanvas.height / mapBounds.height);
        const offsetX = (minimapCanvas.width - mapBounds.width * scale) / 2;
        const offsetY = (minimapCanvas.height - mapBounds.height * scale) / 2;

        hexagons.forEach(hex => {
            const mmX = (hex.x - mapBounds.minX) * scale + offsetX;
            const mmY = (hex.y - mapBounds.minY) * scale + offsetY;
            minimapCtx.fillStyle = hexToRgba(hex.imperium_color, 0.3);
            minimapCtx.fillRect(Math.floor(mmX), Math.floor(mmY), 2, 2); 
        });
    }

    // Rendering

    function drawHexagonPath(ctx, x, y, r) {
        ctx.beginPath();
        ctx.moveTo(x + r * HEX_CORNERS[0].x, y + r * HEX_CORNERS[0].y);
        for (let i = 1; i < 6; i++) {
            ctx.lineTo(x + r * HEX_CORNERS[i].x, y + r * HEX_CORNERS[i].y);
        }
        ctx.closePath();
    }

    /**
     * Konvertiert HEX-Farbe zu RGBA mit angegebener Transparenz
     * @param {string} hex - Hex-Farbe z.B. '#FF5733'
     * @param {number} alpha - Alpha-Wert zwischen 0 und 1
     * @returns {string} RGBA-Farbstring
     */
    function hexToRgba(hex, alpha) {
        if (!hex) return `rgba(0, 0, 0, ${alpha})`;
        // Entferne '#' falls vorhanden
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function draw() {
        // Hintergrund
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        
        // Kamera Transformation
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camera.x, -camera.y);
        const viewL = camera.x - (canvas.width / 2) / camera.zoom - HEX_SIZE;
        const viewR = camera.x + (canvas.width / 2) / camera.zoom + HEX_SIZE;
        const viewT = camera.y - (canvas.height / 2) / camera.zoom - HEX_SIZE;
        const viewB = camera.y + (canvas.height / 2) / camera.zoom + HEX_SIZE;

        hexagons.forEach(hex => {
            // Skip wenn außerhalb des Bildschirms
            if (hex.x < viewL || hex.x > viewR || hex.y < viewT || hex.y > viewB) 
                return;

            // Imperium-Farbe mit Transparenz (0.3) zeichnen - GANZ UNTEN als Hintergrund
            // Wenn Imperium vorhanden, Imperium-Farbe mit 0.3 Alpha, sonst schwarz mit 0.3 Alpha
            drawHexagonPath(ctx, hex.x, hex.y, HEX_SIZE);
            if (hex.imperium_color) {
                ctx.fillStyle = hexToRgba(hex.imperium_color, 0.3);
            } else {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            }
            ctx.fill();
            
            // Image (über dem Farbhintergrund)
            if (hex.image_url && images[hex.image_url]) {
                const size = HEX_WIDTH; 
                ctx.drawImage(images[hex.image_url], hex.x - size/2, hex.y - size/2, size, size);
            }
            
            // Hexagon-Rahmen zeichnen
            drawHexagonPath(ctx, hex.x, hex.y, HEX_SIZE);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#333';
            ctx.stroke();

            // Indikator für Schiffe zeichnen (Gelbes Hexagon)
            if (hex.has_ships) {
                drawHexagonPath(ctx, hex.x, hex.y, HEX_SIZE);
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#FFFF00';
                ctx.stroke();
            }

            // Selektion Highlight
            if (hex.id == selectedHexId) {
                drawHexagonPath(ctx, hex.x, hex.y, HEX_SIZE);
                ctx.lineWidth = 5;
                ctx.strokeStyle = '#00ff00';
                ctx.stroke();
            }
        });

        ctx.restore();

        updateMinimap();
    }

    function updateMinimap() {
        if (!minimapViewport || !minimapCanvas || mapBounds.width === 0) return;

        // Skalierungsfaktor und Versatz für die Minimap berechnen
        const scale = Math.min(minimapCanvas.width / mapBounds.width, minimapCanvas.height / mapBounds.height);
        const offsetX = (minimapCanvas.width - mapBounds.width * scale) / 2;
        const offsetY = (minimapCanvas.height - mapBounds.height * scale) / 2;

        // Sichtbaren Bereich der Hauptkarte in Welt-Koordinaten
        const viewWidth = canvas.width / camera.zoom;
        const viewHeight = canvas.height / camera.zoom;
        const viewLeft = camera.x - viewWidth / 2;
        const viewTop = camera.y - viewHeight / 2;

        // Position und Größe des Viewports auf der Minimap berechnen
        const mmX = (viewLeft - mapBounds.minX) * scale + offsetX;
        const mmY = (viewTop - mapBounds.minY) * scale + offsetY;
        const mmW = viewWidth * scale;
        const mmH = viewHeight * scale;

        // CSS des Viewport-Rechtecks aktualisieren
        minimapViewport.style.left = `${mmX}px`;
        minimapViewport.style.top = `${mmY}px`;
        minimapViewport.style.width = `${mmW}px`;
        minimapViewport.style.height = `${mmH}px`;
        
        // Zoom-Anzeige aktualisieren
        if (zoomDisplay) zoomDisplay.textContent = `ZOOM: ${camera.zoom.toFixed(2)}x`;
    }
    
    // --- Interaktion ---

    container.addEventListener('mousedown', e => {
        if (e.button !== 0) 
            return; // Nur Linksklick
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
            
            constrainCamera();
            requestAnimationFrame(draw);
        }
    });

    container.addEventListener('wheel', e => {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const direction = Math.sign(e.deltaY); 
        const scaleFactor = Math.exp(direction * -zoomIntensity); 
        
        const newZoom = Math.max(0.10, Math.min(5.0, camera.zoom * scaleFactor));
        camera.zoom = newZoom;
        constrainCamera();
        
        requestAnimationFrame(draw);
    }, { passive: false });

    container.addEventListener('click', e => {
        if (isDragging) 
            return; 

        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const worldX = (mx - canvas.width / 2) / camera.zoom + camera.x;
        const worldY = (my - canvas.height / 2) / camera.zoom + camera.y;

        let closestHex = null;
        let minDistSq = Infinity;
        const radiusSq = (HEX_SIZE) * (HEX_SIZE); 

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
            
            const event = new CustomEvent('sectorChanged', { detail: { sectorID: closestHex.id } });
            document.dispatchEvent(event);
        }
    });

    function setupSearch() {
        if (!searchInput || !searchResultsContainer) 
            return;

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            searchResultsContainer.innerHTML = '';

            if (query.length < 2) 
                return;

            const results = [];
            for (const hex of hexagons) {
                // Suche nach Sektor ID
                if (hex.id.toString().includes(query)) {
                    results.push({
                        type: 'Sektor',
                        text: `Sektor ${hex.id}`,
                        hex: hex
                    });
                }

                // Suche nach Schiffen
                if (hex.ship_names) {
                    for (const shipName of hex.ship_names) {
                        if (shipName.toLowerCase().includes(query)) {
                            results.push({
                                type: 'Schiff',
                                text: `${shipName} (Sektor ${hex.id})`,
                                hex: hex
                            });
                        }
                    }
                }

                if (hex.planets) {
                    for (const planet of hex.planets) {
                        if (planet.name.toLowerCase().includes(query)) {
                            results.push({
                                type: 'Planet',
                                text: `${planet.name} (Sektor ${hex.label})`,
                                hex: hex
                            });
                        }
                    }
                }

                if (results.length >= 5) 
                    break; 
            }

            if (results.length > 0) {
                for (const result of results.slice(0, 5)) {
                    const item = document.createElement('a');
                    item.href = '#';
                    item.className = 'list-group-item list-group-item-action py-1 px-2 small';
                    item.textContent = result.text;
                    item.onclick = (e) => {
                        e.preventDefault();
                        camera.x = result.hex.x;
                        camera.y = result.hex.y;
                        camera.zoom = 0.2;
                        selectedHexId = result.hex.id;
                        
                        searchInput.value = '';
                        searchResultsContainer.innerHTML = '';
                        constrainCamera();
                        requestAnimationFrame(draw);

                        const event = new CustomEvent('sectorChanged', { detail: { sectorID: result.hex.id } });
                        document.dispatchEvent(event);
                    };
                    searchResultsContainer.appendChild(item);
                }
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchResultsContainer.contains(e.target) && e.target !== searchInput) {
                searchResultsContainer.innerHTML = '';
            }
        });
    }
});
