import logging
import json
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.forms.models import model_to_dict
from karte.models import cls_sektor
from .models import cls_schiffe

# Logger initialisieren
logger = logging.getLogger(__name__)

def get_sector_fleet_details_json(request, sectorID):
    # 1. Sektor holen (mit prefetch_related für bessere Performance)
    # Nutzt deinen related_name='istPos'
    sector = get_object_or_404(cls_sektor.objects.prefetch_related('istPos'), id=sectorID)
    
    # 2. Basis-Daten des Sektors in Dict umwandeln
    sector_dict = model_to_dict(sector)
    
    # 3. Schiffe aus dem Sektor holen
    schiffe_queryset = sector.istPos.all()
    
    # 4. Liste für die Schiffsdaten bauen (Manuelle Serialisierung)
    schiffe_liste = []
    for schiff in schiffe_queryset:
        # Hier entscheidest du, welche Felder das JS sehen darf
        schiffe_liste.append({
            "id": schiff.id,
            "name": schiff.m_name,
            "klasse_name": schiff.m_klasse.m_name if schiff.m_klasse else "Unbekannt",
            "bild": schiff.m_imgname,
            "hp": schiff.m_akt_hitpoints,
            "max_hp": schiff.m_klasse.m_hitpoint if schiff.m_klasse else 0,
            "getarnt": schiff.m_getarnt
        })
    
    # 5. Die Schiffe in das Sektor-Dict einfügen
    sector_dict['schiffe'] = schiffe_liste
    sector_dict['anzahl_schiffe'] = len(schiffe_liste)

    # Logging für die Konsole
    logger.info(f"Sektor {sectorID}: {len(schiffe_liste)} Schiffe gefunden.")
    
    # 6. Alles zusammen als JSON senden
    return JsonResponse(sector_dict)