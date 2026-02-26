import logging
from collections import defaultdict
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from karte.models import cls_sektor
from .models import cls_schiffe
from django.forms.models import model_to_dict

logger = logging.getLogger(__name__)

# Hilfsfunktion für sicheren Attribut-Zugriff
def get_val(obj, *attrs):
    for attr in attrs:
        obj = getattr(obj, attr, None)
        if obj is None: break
    return obj
        
def get_sector_fleet_details_json(request, sectorID):
    sector = get_object_or_404(cls_sektor, id=sectorID)

    ships_in_sector = cls_schiffe.objects.filter(m_istPos=sector).select_related(
        'm_imperium', 'm_klasse__m_schiffskategorie', 'm_warpkern', 
        'm_schilde', 'm_deflektor', 'm_sensor'
    )

    if not ships_in_sector.exists():
        return JsonResponse({'message': 'no ships in the sector'})

    # Die korrekte Struktur: Ein Dict, das Dicts enthält, die Listen enthalten
    # Das verhindert den AttributeError, da die letzte Ebene fest als Liste definiert ist
    ships_from_imperium = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))

    for ship in ships_in_sector:

        imp_name = get_val(ship, 'm_imperium', 'm_name') or "Unknown"
        cat_name = get_val(ship, 'm_klasse', 'm_schiffskategorie', 'm_name') or "Unknown Category"
        class_name = get_val(ship, 'm_klasse', 'm_name') or "Unknown Class"


        ships_from_imperium[imp_name][cat_name][class_name].append({
            'id': ship.id,
            'name': getattr(ship, 'm_name', f"Ship {ship.id}"),
            'components': {
                'warpkern': model_to_dict(ship.m_warpkern),
                'deflektor': model_to_dict(ship.m_deflektor),
                'sensor': model_to_dict(ship.m_sensor),
                'schilde': model_to_dict(ship.m_schilde),
            }
        })

    return JsonResponse(ships_from_imperium)