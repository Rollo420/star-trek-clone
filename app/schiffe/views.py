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

    #Dsa ist quasi der Dango Innerjoin über zwei Klassen (m_klasse, cls_schiffskalsse)# Du folgst den Variablennamen aus deinen Models:
    shipInSector = cls_schiffe.objects.filter(m_istPos=sector).select_related('m_sensor','m_klasse__m_schiffskategorie')

    if not shipInSector:
        return JsonResponse({'message': 'no ships in the sector'})

    shipsFromImperium = {}
    for ship in shipInSector:

        if ship.m_imperium:
            imperiumName = ship.m_imperium.m_name
            
        else:
            imperiumName = f"Unknown"
        
        if ship.m_klasse:
            shipBuildArt = ship.m_klasse
            
            if ship.m_klasse.m_schiffskategorie:
                shipCatogory = ship.m_klasse.m_schiffskategorie
        else:
            shipBuildArt = None
            shipCatogory = None
        
        
        if imperiumName not in shipsFromImperium:
            shipsFromImperium[imperiumName] = {}

        if shipBuildArt.m_name not in shipsFromImperium[imperiumName]:
            shipsFromImperium[imperiumName][shipBuildArt.m_name] = {}
            
            if shipCatogory.m_name not in shipsFromImperium[imperiumName][shipBuildArt.m_name]:
                shipsFromImperium[imperiumName][shipBuildArt.m_name][shipCatogory.m_name] = []
                
        shipsFromImperium[imperiumName][shipBuildArt.m_name][shipCatogory.m_name] = (model_to_dict(ship, exclude=['cls_Module']))
        
    return JsonResponse(shipsFromImperium)
