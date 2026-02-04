import logging
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from karte.models import cls_sektor
from . import models

# Zentrales Logging - funktioniert automatisch mit Django!
logger = logging.getLogger(__name__)

# Create your views here.

def get_sector_fleet_details_json(request, sectorID):
    
    sector = cls_sektor.objects.get(id=sectorID)
    
    return JsonResponse({
        'id': sector.id,
        'name': sector.c_name,
        # Füge hier weitere Felder hinzu, die du brauchst
    })
    
