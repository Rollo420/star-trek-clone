import math
from .models import cls_sektor
from planet.models import cls_planet
from django.templatetags.static import static

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

        for sektor in cls_sektor.objects.all():
            q = sektor.m_cx
            r = sektor.m_cz

            # Verschiebung der Koordinaten, um das Zentrum zu berücksichtigen
            # Hier wird das zentrale Hexagon auf (0,0) positioniert
            q_shifted = q - center_q
            r_shifted = r - center_r

            # Korrigierte X- und Y-Berechnungen basierend auf den verschobenen Koordinaten
            x = scale * (math.sqrt(3) * r_shifted + math.sqrt(3)/2 * q_shifted)
            y = scale * (3/2 * q_shifted)

            min_x, max_x = min(min_x, x), max(max_x, x)
            min_y, max_y = min(min_y, y), max(max_y, y)

            image_data = cls.get_image_data(sektor)

            hexagons.append({
                "id": sektor.id,
                "label": f"({q},{r},{-q-r})",
                "x": x,
                "y": y,
                "planets": planeten_map.get(sektor.id, []),
                "image_url": image_data['url'],
                "rotation": image_data['rotation'],
            })

        for hex in hexagons:
            hex["x"] -= min_x
            hex["y"] -= min_y
        
        grid_width = (max_x - min_x) + hex_size * math.sqrt(3)
        grid_height = (max_y - min_y) + hex_size * 2
        
        return hexagons, grid_width, grid_height