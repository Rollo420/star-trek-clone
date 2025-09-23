from django.shortcuts import render
from .models import cls_galaxy, cls_sektor
import math

# Die Koordinate der Mitte des Gitters, um es zu zentrieren
GRID_CENTER_Q = 0
GRID_CENTER_R = 0



def index(request):
    return render(request, 'karte/base.html')
    
def generate_axial_hex_map(rows, cols, hex_size, gap_px=0):
    """
    Erstellt eine Liste von Hexagon-Daten basierend auf axialen Koordinaten.
    `hex_size` ist der Radius des Sechsecks.
    `gap_px` ist der zusätzliche Abstand in Pixeln zwischen den Hexagonen.
    """
    hexagons = []
    
    # Der Offset zur Zentrierung des Gitters
    col_offset = cols // 2
    row_offset = rows // 2
    
    # Skalierungsfaktor für die Koordinaten
    scale = hex_size + gap_px
    
    counter = 1
    for r in range(rows):
        for q in range(cols):
            current_q = q - col_offset
            current_r = r - row_offset

            s = -current_q - current_r

            # Korrekte Berechnung der Pixelkoordinaten mit Abstand
            x = scale * (math.sqrt(3) * current_q + math.sqrt(3)/2 * current_r)
            y = scale * (3/2 * current_r)
            
            hexagons.append({
                "id": counter,
                "label": f"({current_q}, {current_r}, {s})",
                "x": x,
                "y": y,
                "colors": ["#ff9999", "#99ff99", "#9999ff", "#ffff99", "#ff99ff", "#99ffff"]
            })
            counter += 1
            
    return hexagons

#def map_view(request):
#    rows = cls_galaxy.m_sizey
#    cols = cls_galaxy.m_sizex
#    hex_size = 80 
#    gap = 8 # Der gewünschte Abstand von 5px
#    
#    hexagons = generate_axial_hex_map(rows, cols, hex_size, gap_px=gap)
#    
#    # Berechne die Größe des SVG-Containers basierend auf dem neuen Abstand
#    grid_width = (cols * (hex_size + gap) * math.sqrt(3)) + ((hex_size + gap) * math.sqrt(3) / 2)
#    grid_height = (rows * (hex_size + gap) * 1.5) + ((hex_size + gap) / 2)
#    
#    return render(request, "karte/map.html", {
#        "hexagons": hexagons,
#        "grid_width": grid_width,
#        "grid_height": grid_height,
#    })

def load_hex_map_rect_from_db(hex_size, gap_px=0):
    hexagons = []
    scale = hex_size + gap_px

    min_x, min_y = float("inf"), float("inf")
    max_x, max_y = float("-inf"), float("-inf")

    for sektor in cls_sektor.objects.all():
        col = sektor.m_x
        row = sektor.m_y

        # Odd-r layout (jeder ungerade row verschiebt sich nach rechts)
        x = scale * math.sqrt(3) * (col + 0.5 * (row % 2))
        y = scale * 3/2 * row

        # Cube coords nur für Anzeige
        q = col
        r = row
        s = -q - r

        # Bounding Box
        min_x, max_x = min(min_x, x), max(max_x, x)
        min_y, max_y = min(min_y, y), max(max_y, y)

        hexagons.append({
            "id": sektor.id,
            "label": f"({q},{r},{s})",
            "x": x,
            "y": y,
            "colors": ["#ff9999", "#99ff99", "#9999ff",
                       "#ffff99", "#ff99ff", "#99ffff"]
        })

    # SVG Größe exakt passend
    grid_width = (max_x - min_x) + 2 * hex_size
    grid_height = (max_y - min_y) + 2 * hex_size

    # Alles ins positive verschieben
    for hex in hexagons:
        hex["x"] = hex["x"] - min_x + hex_size
        hex["y"] = hex["y"] - min_y + hex_size

    return hexagons, grid_width, grid_height

def map_view(request):
    hex_size = 80
    gap = 8

    hexagons, grid_width, grid_height = load_hex_map_rect_from_db(hex_size, gap_px=gap)

    return render(request, "karte/map.html", {
        "hexagons": hexagons,
        "grid_width": grid_width,
        "grid_height": grid_height,
    })

    
def fetch_map_model(request):
    all_sektors = cls_sektor.objects.all()
    
    print("Starte die Ausgabe der Sektoren:")
    for sektor in all_sektors:
        print(f"Sektor ID: {sektor.id}, Position: ({sektor.m_x}, {sektor.m_y})")
    
    # ... Rest des Codes
    return render(request, "karte/map.html")