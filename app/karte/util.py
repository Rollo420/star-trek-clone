import logging
import math
from .models import cls_sektor
from planet.models import cls_planet
from schiffe.models import cls_schiffe
from django.templatetags.static import static

# Zentrales Logging - funktioniert automatisch mit Django!
logger = logging.getLogger(__name__)

# Die Map, die Bildpfade und Rotationswerte enthält.
IMAGE_MAPPING = {
    1: {'path': 'img/BilderGalaxy/Stern_1.png', 'rotation': 0},
    2: {'path': 'img/BilderGalaxy/Stern_2.png', 'rotation': 0},
    3: {'path': 'img/BilderGalaxy/Stern_3.png', 'rotation': 0},
    4: {'path': 'img/BilderGalaxy/Stern_4.png', 'rotation': 0},
    5: {'path': 'img/BilderGalaxy/Stern_5.png', 'rotation': 0},
    6: {'path': 'img/BilderGalaxy/Stern_1.png', 'rotation': 0},
    7: {'path': 'img/BilderGalaxy/Stern_2.png', 'rotation': 0},
    8: {'path': 'img/BilderGalaxy/Stern_3.png', 'rotation': 0},
    9: {'path': 'img/BilderGalaxy/Stern_4.png', 'rotation': 0},
    11: {'path': 'img/BilderGalaxy/Supernova_A_1.png', 'rotation': 0},
    12: {'path': 'img/BilderGalaxy/Supernova_A_2.png', 'rotation': 0},
    13: {'path': 'img/BilderGalaxy/Supernova_A_3.png', 'rotation': 0},
    14: {'path': 'img/BilderGalaxy/Supernova_A_4.png', 'rotation': 0},
    15: {'path': 'img/BilderGalaxy/Supernova_A_5.png', 'rotation': 0},
    16: {'path': 'img/BilderGalaxy/Supernova_A_6.png', 'rotation': 0},
    17: {'path': 'img/BilderGalaxy/Supernova_A_7.png', 'rotation': 0},
    18: {'path': 'img/BilderGalaxy/Nebel_A_ol1.png', 'rotation': 0},
    19: {'path': 'img/BilderGalaxy/Nebel_A_ol2.png', 'rotation': 0},
    20: {'path': 'img/BilderGalaxy/Nebel_A_ol3.png', 'rotation': 0},
    21: {'path': 'img/BilderGalaxy/Nebel_A_ol4.png', 'rotation': 0},
    22: {'path': 'img/BilderGalaxy/Nebel_A_ol5.png', 'rotation': 0},
    23: {'path': 'img/BilderGalaxy/Nebel_A_ol6.png', 'rotation': 0},
}

class cls_map_randerer:
    @staticmethod
    def get_sektor_planets():
        sektor_planeten = {}
        for planet in cls_planet.objects.all():
            sid = planet.m_sektor_id
            if sid not in sektor_planeten:
                sektor_planeten[sid] = []
            sektor_planeten[sid].append(planet)
        return sektor_planeten

    @staticmethod
    def get_image_data(sektor):
        """
        Gibt eine Map mit der URL und der Rotation für das Sektor-Bild zurück.
        """
        if sektor.m_sektorobjekt:
            m_art = sektor.m_sektorobjekt.m_art
            image_data = IMAGE_MAPPING.get(m_art)
            if image_data:
                return {
                    'url': static(image_data['path']),
                    'rotation': image_data['rotation']
                }
        return {'url': None, 'rotation': 0}

    @classmethod
    def load_hex_map_from_db(cls, hex_size, gap_px=0, center_q=100, center_r=102):
        hexagons = []
        scale = hex_size + gap_px

        min_x, min_y = float("inf"), float("inf")
        max_x, max_y = float("-inf"), float("-inf")
        
        planeten_map = cls.get_sektor_planets()
        
        sectors_with_ships = 0
        sectors_without_ships = 0
        total_ships = 0
        all_ships = cls_schiffe.objects.filter(m_istPos__isnull=False).values('m_istPos', 'm_name')
        ships_lookup = {}

        for ship in all_ships:
            sid = ship['m_istPos']
            if sid not in ships_lookup:
                ships_lookup[sid] = []
            ships_lookup[sid].append(ship['m_name'])

        for sektor in cls_sektor.objects.select_related('m_sektorobjekt').all():
            q = sektor.m_cx
            r = sektor.m_cz
            q_shifted = q - center_q
            r_shifted = r - center_r
            x = scale * (math.sqrt(3) * r_shifted + math.sqrt(3)/2 * q_shifted)
            y = scale * (3/2 * q_shifted)

            min_x, max_x = min(min_x, x), max(max_x, x)
            min_y, max_y = min(min_y, y), max(max_y, y)

            image_data = cls.get_image_data(sektor)
            
            # Prüfe ob Schiffe in diesem Sektor vorhanden sind
            # Statt DB-Query nutzen wir jetzt das Lookup-Dictionary (Memory ist viel schneller als DB)
            ship_names = ships_lookup.get(sektor.id, [])
            ship_count = len(ship_names)
            has_ships = ship_count > 0
            
            if has_ships:
                sectors_with_ships += 1
                total_ships += ship_count
            else:
                sectors_without_ships += 1

            hexagons.append({
                "id": sektor.id,
                "label": f"({q},{r},{-q-r})",
                "x": x,
                "y": y,
                "planets": planeten_map.get(sektor.id, []),
                "image_url": image_data['url'],
                "rotation": image_data['rotation'],
                "has_ships": has_ships,
                "ship_count": ship_count,
                "ship_names": ship_names,
            })

        for hex in hexagons:
            hex["x"] -= min_x
            hex["y"] -= min_y
        
        grid_width = (max_x - min_x) + hex_size * math.sqrt(3)
        grid_height = (max_y - min_y) + hex_size * 2
        
        # Logging der Zusammenfassung
        logger.info(f"Map geladen: {len(hexagons)} Sektoren | Mit Schiffen: {sectors_with_ships} | Ohne Schiffe: {sectors_without_ships} | Gesamtschiffe: {total_ships}")
        
        return hexagons, grid_width, grid_height
