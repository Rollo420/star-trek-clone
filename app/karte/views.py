from django.shortcuts import render
from .util import cls_map_randerer

# Die Koordinate der Mitte des Gitters, um es zu zentrieren
GRID_CENTER_Q = 0
GRID_CENTER_R = 0


def index(request):
    return render(request, 'karte/base.html')

def map_view(request):
    hex_size = 80
    gap = 8

    hexagons, grid_width, grid_height = cls_map_randerer.load_hex_map_from_db(hex_size, gap_px=gap)

    # Drehung um 90 Grad, um das Hex-Gitter zu korrigieren
    rotation_90 = True

    return render(request, "karte/map.html", {
        "hexagons": hexagons,
        "grid_width": grid_width,
        "grid_height": grid_height,
        "rotation_90": rotation_90,
    })

def fetch_map_model(request):
    from .models import cls_sektor
    all_sektors = cls_sektor.objects.all()

    print("----- STARTE AUSGABE ALLER SEKTOREN -----")
    count = 0
    for sektor in all_sektors:
        print(f"Sektor ID: {sektor.id}")
        print(f"  Position: ({sektor.m_x}, {sektor.m_y})")
        print(f"  cx,cy,cz: ({sektor.m_cx}, {sektor.m_cy}, {sektor.m_cz})")
        print(f"  Subraumenergie: {sektor.m_subraumenergielevel}")
        print(f"  sektorobjekt: {sektor.getSonnenSystem()}")
        print("-" * 40)

        count += 1
        if count >= 10 and sektor.getSonnenSystem():   # nach 10 Objekten abbrechen
            break

    print("----- ENDE DER AUSGABE -----")

    return render(request, "karte/map.html")
