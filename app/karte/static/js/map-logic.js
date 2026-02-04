document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('hex-map');
    const selectionColor = '#00ff00';
    let selectedHex = null;
    const map = document.getElementById('hex-map-scroll');
    
    map.addEventListener('wheel', e => {
        e.preventDefault();
        let zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
        let viewbox = svg.viewBox.baseVal;

        let svgPoint = svg.createSVGPoint();
        svgPoint.x = e.clientX;
        svgPoint.y = e.clientY;
        let CTM = svg.getScreenCTM().inverse();
        let transformedPoint = svgPoint.matrixTransform(CTM);

        viewbox.x += (transformedPoint.x - viewbox.x) * (1 - zoomFactor);
        viewbox.y += (transformedPoint.y - viewbox.y) * (1 - zoomFactor);
        viewbox.width *= zoomFactor;
        viewbox.height *= zoomFactor;

        svg.setAttribute('viewBox', `${viewbox.x} ${viewbox.y} ${viewbox.width} ${viewbox.height}`);
        debouncedRender();
    }, { passive: false });
    });

    map.addEventListener('mousedown', e => {
        if (e.button !== 0) return;
        isDragging = true;
        map.style.cursor = 'grabbing';
        startX = e.clientX;
        startY = e.clientY;
        let viewbox = svg.viewBox.baseVal;
        viewboxStart.x = viewbox.x;
        viewboxStart.y = viewbox.y;
    });
    map.addEventListener('mouseup', () => {
        isDragging = false;
        map.style.cursor = 'grab';
    });
    map.addEventListener('mouseleave', () => {
        isDragging = false;
        map.style.cursor = 'grab';
    });
    map.addEventListener('mousemove', e => {
        if (!isDragging) return;
        let viewbox = svg.viewBox.baseVal;
        let scale = viewbox.width / map.clientWidth;
        let dx = (e.clientX - startX) * scale;
        let dy = (e.clientY - startY) * scale;
        viewbox.x = viewboxStart.x - dx;
        viewbox.y = viewboxStart.y - dy;
        svg.setAttribute('viewBox', `${viewbox.x} ${viewbox.y} ${viewbox.width} ${viewbox.height}`);
        debouncedRender();
    });

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