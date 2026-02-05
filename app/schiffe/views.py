import logging
import json
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.forms.models import model_to_dict
from karte.models import cls_sektor
from imperium.models import cls_ImperiumScan
from .models import cls_schiffe

# Logger initialisieren
logger = logging.getLogger(__name__)

def get_sector_fleet_details_json(request, sectorID):

    sector = get_object_or_404(cls_sektor, id=sectorID)

    shipInSector = cls_schiffe.objects.filter(m_istPos=sector)

    if not shipInSector:
        return JsonResponse({'message': 'no ships in the sector'})

    shipsFromImperium = {}
    for ship in shipInSector:

        if ship.m_imperium:
            imperiumName = ship.m_imperium.m_name
        else:
            imperiumName = f"Unknown"
        
        ship_data = model_to_dict(ship, exclude=[
            'm_warpkern', 'm_schilde', 'm_deflektor', 'm_sensor', 
            'm_impulsantrieb', 'm_konsole', 'm_strahlenwaffen', 'm_torpedo'
        ])
        
        if imperiumName not in shipsFromImperium:
            shipsFromImperium[imperiumName] = []
        shipsFromImperium[imperiumName].append(ship_data)
        
    return JsonResponse(shipsFromImperium)
