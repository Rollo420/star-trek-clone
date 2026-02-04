from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .util import cls_map_randerer
from .models import cls_sektor
from planet.models import cls_planet
from schiffe.models import cls_schiffe
from django.template.loader import render_to_string
from .logger import debug, info, error, logger

# Die Koordinate der Mitte des Gitters, um es zu zentrieren
GRID_CENTER_Q = 0
GRID_CENTER_R = 0

def index(request):
    return render(request, 'karte/base.html')

def map_view(request):
    hex_size = 80
    gap = 8

    # Load hex map - ship checking and logging is done in util.py
    hexagons, grid_width, grid_height = cls_map_randerer.load_hex_map_from_db(hex_size, gap_px=gap)

    # Drehung um 90 Grad, um das Hex-Gitter zu korrigieren
    rotation_90 = True

    # Count sectors with ships from the loaded data
    sectors_with_ships = [h for h in hexagons if h.get('has_ships', False)]
    
    # Log detailed ship info for sectors with ships (weniger verbose als vorher)
    if sectors_with_ships:
        debug(f"Anzahl der Sektoren mit Schiffen: {len(sectors_with_ships)}", error_type="MAP_VIEW")
        for hex in sectors_with_ships[:10]:  # Nur die ersten 10 für Lesbarkeit
            debug(
                f"Sektor ID {hex['id']} | Position {hex['label']} | Schiffe: {hex['ship_count']}",
                error_type="MAP_VIEW"
            )
        if len(sectors_with_ships) > 10:
            debug(f"... und weitere {len(sectors_with_ships) - 10} Sektoren mit Schiffen", error_type="MAP_VIEW")

    return render(request, "karte/map.html", {
        "hexagons": hexagons,
        "grid_width": grid_width,
        "grid_height": grid_height,
        "rotation_90": rotation_90,
    })

def fetch_map_model(request):
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

def get_planet_image_index(sektor_id, planet_id, num_images=5):
    """
    Returns a consistent pseudo-random image index for planets within a sector.
    """
    import hashlib
    key = f"{sektor_id}-{planet_id}".encode('utf-8')
    hash_digest = hashlib.md5(key).hexdigest()
    hash_int = int(hash_digest, 16)
    return hash_int % num_images + 1  # 1 to 5

def sector_detail_json(request, sektor_id):
    sektor = get_object_or_404(cls_sektor, id=sektor_id)
    planets = cls_planet.objects.filter(m_sektor=sektor)
    ships = cls_schiffe.objects.filter(m_istPos=sektor)

    image_data = cls_map_randerer.get_image_data(sektor)

    # planets_with_indices: (planet, img_num)
    planets_with_indices = [(planet, get_planet_image_index(sektor.pk, planet.pk)) for planet in planets]

    context = {
        'sektor': sektor,
        'planets_with_indices': planets_with_indices,
        'ships': ships,
        'image_url': image_data['url'],
        'subraumenergielevel': sektor.m_subraumenergielevel,
    }
    
    if ships:
        debug(f"Anzahl der Schiffe im Sektor {sektor_id}: {len(ships)}", error_type="SEKTOR_DETAIL")
        
    html = render_to_string('karte/sector_detail.html', context)
    return JsonResponse({'html': html})


def get_sector_fleet_details_json(sectorID):
        sector = 