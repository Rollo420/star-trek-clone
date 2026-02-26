# Django Migration Guide: m_color Feld hinzufügen mit unique=True

## Übersicht

Da deine Datenbank bereits Daten enthält und das `unique=True` bei der Migration fehlschlägt, folge diesem 3-Schritte-Prozess:

```
┌─────────────────────────────────────────────────────────────────────┐
│  SCHRITT 1: temporary Änderung → Migration erstellen + Data Migration│
│  SCHRITT 2: unique=True setzen → saubere Migration                  │
│  SCHRITT 3: Model finalisieren → restore unique=True                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## SCHRITT 1: Model vorbereiten & initiale Migration erstellen

### 1.1 Temporäre Model-Änderung

**Datei:** `app/imperium/models.py`

Ändere das `m_color` Feld temporär (unique=False, null=True, blank=True):

```python
class cls_imperium(models.Model):
    m_name = models.CharField(max_length=100, unique=True)
    m_rasse = models.ForeignKey('cls_rassen', on_delete=models.CASCADE, blank=True, null=True, related_name='rasse')
    
    # TEMPORÄR: unique=False, null=True, blank=True
    m_color = models.CharField(max_length=7, unique=False, null=True, blank=True)
    
    # ... restliche Methoden ...
```

### 1.2 Docker Container starten (falls noch nicht aktiv)

```bash
# Container starten
docker-compose up -d

# Container Status prüfen
docker-compose ps
```

### 1.3 Initiale Migration erstellen

```bash
# Migration erstellen (ohne unique=True)
docker-compose exec django python manage.py makemigrations imperium --name add_m_color_temp

# Erwartete Ausgabe:
# Migrations for 'imperium':
#   imperium/migrations/0003_add_m_color_temp.py created
```

### 1.4 Data Migration erstellen

Erstelle die Data Migration direkt in der existierenden Migrationsdatei:

**Bearbeite:** `app/imperium/migrations/0003_add_m_color_temp.py`

```python
import random
from django.db import migrations


def generate_unique_random_color(apps, schema_editor):
    """
    Generiert eine zufällige Hex-Farbe, die noch nicht vergeben ist.
    """
    cls_imperium = apps.get_model('imperium', 'cls_imperium')
    used_colors = set(cls_imperium.objects.values_list('m_color', flat=True))
    used_colors.discard(None)  # None-Werte ignorieren
    
    for imperium in cls_imperium.objects.filter(m_color__isnull=True):
        while True:
            color = '#{:06x}'.format(random.randint(0, 0xFFFFFF))
            if color not in used_colors:
                imperium.m_color = color
                imperium.save()
                used_colors.add(color)
                break


def reverse_colors(apps, schema_editor):
    """
    Setzt alle m_color Felder zurück (für Migration-Rollback).
    """
    cls_imperium = apps.get_model('imperium', 'cls_imperium')
    cls_imperium.objects.all().update(m_color=None)


class Migration(migrations.Migration):

    dependencies = [
        ('imperium', '0002_cls_imperiumscan'),
    ]

    operations = [
        # Feld OHNE unique=True hinzufügen
        migrations.AddField(
            model_name='cls_imperium',
            name='m_color',
            field=models.CharField(blank=True, max_length=7, null=True),
        ),
        # Data Migration ausführen
        migrations.RunPython(generate_unique_random_color, reverse_colors),
    ]
```

### 1.5 Migration ausführen

```bash
# Migration anwenden
docker-compose exec django python manage.py migrate imperium

# Erwartete Ausgabe:
# Operations to perform:
#   Apply all migrations: imperium
# Running migrations:
#   Applying imperium.0003_add_m_color_temp... OK
```

### 1.6 Prüfen, ob alle Imperien eine Farbe haben

```bash
# Alle Imperien mit ihren Farben anzeigen
docker-compose exec django python manage.py shell -c "
from imperium.models import cls_imperium
for imp in cls_imperium.objects.all():
    print(f'{imp.m_name}: {imp.m_color}')
"
```

---

## SCHRITT 2: unique=True hinzufügen (zweite saubere Migration)

### 2.1 Zweite Migration für unique=True erstellen

```bash
# Jetzt kann unique=True hinzugefügt werden, da alle Daten existieren
docker-compose exec django python manage.py makemigrations imperium --name add_unique_to_m_color

# Erwartete Ausgabe:
# Migrations for 'imperium':
#   imperium/migrations/0004_add_unique_to_m_color.py created
```

### 2.2 Resultierende Migration prüfen

Die automatisch erstellte Migration sollte so aussehen:

**Datei:** `app/imperium/migrations/0004_add_unique_to_m_color.py`

```python
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('imperium', '0003_add_m_color_temp'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cls_imperium',
            name='m_color',
            field=models.CharField(max_length=7, unique=True),
        ),
    ]
```

### 2.3 Migration anwenden

```bash
# Migration mit unique=True anwenden
docker-compose exec django python manage.py migrate imperium

# Erwartete Ausgabe:
# Operations to perform:
#   Apply all migrations: imperium
# Running migrations:
#   Applying imperium.0004_add_unique_to_m_color... OK
```

---

## SCHRITT 3: Model finalisieren

### 3.1 Original-Code mit unique=True wiederherstellen

**Datei:** `app/imperium/models.py`

Stelle die original `save()`-Methode und `generate_unique_random_color()` wieder her:

```python
import random
from django.db import models

class cls_diplomatieabkommen(models.TextChoices):
    FRIEDEN = "FR", "Frieden"
    KRIEG = "KR", "Krieg"
    BÜNDNIS = "BU", "Bündnis"
    HANDEL = "HA", "Handelsabkommen"
    NICHT_ANGRIFF = "NA", "Nichtangriffspakt"
    NEUTRAL = "NE", "Neutralität"  
    

    
class cls_imperium(models.Model):
    m_name = models.CharField(max_length=100, unique=True)  # name of the group
    m_rasse = models.ForeignKey('cls_rassen', on_delete=models.CASCADE, blank=True, null=True, related_name='rasse')
    m_color = models.CharField(max_length=7, unique=True)  # Hex color code (e.g., #FF0000)
    
    def __str__(self):
        return self.m_name
    
    def save(self, *args, **kwargs):
        # Wenn das Objekt noch keine Farbe hat (neu erstellt), generiere eine zufällige unikate Farbe
        if not self.m_color:
            self.m_color = cls_imperium.generate_unique_random_color()
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_unique_random_color():
        """
        Generiert eine zufällige Hex-Farbe, die noch nicht vergeben ist.
        Wiederholt den Vorgang, bis eine unikate Farbe gefunden wurde.
        """
        used_colors = set(cls_imperium.objects.values_list('m_color', flat=True))
        
        while True:
            # Zufällige Farbe im Format #RRGGBB
            color = '#{:06x}'.format(random.randint(0, 0xFFFFFF))
            if color not in used_colors:
                return color
```

### 3.2 Keine Migration für SCHRITT 3 nötig!

Da nur der Python-Code (die `save()` Methode) hinzugefügt wird und **nicht das Datenbankschema**, ist keine Migration erforderlich. Django-Migrationen ändern nur die Datenbankstruktur, nicht den Python-Code.

---

## Vollständiger Workflow (Copy & Paste)

```bash
# === SCHRITT 1 ===
# 1. Model temporär ändern (unique=False, null=True, blank=True)

# 2. Container starten
docker-compose up -d

# 3. Initiale Migration erstellen
docker-compose exec django python manage.py makemigrations imperium --name add_m_color_temp

# 4. Data Migration manuell hinzufügen (siehe oben)

# 5. Migration ausführen
docker-compose exec django python manage.py migrate imperium

# 6. Prüfen
docker-compose exec django python manage.py shell -c "from imperium.models import cls_imperium; print([(i.m_name, i.m_color) for i in cls_imperium.objects.all()])"

# === SCHRITT 2 ===
# 7. unique=True Migration erstellen
docker-compose exec django python manage.py makemigrations imperium --name add_unique_to_m_color

# 8. Anwenden
docker-compose exec django python manage.py migrate imperium

# === SCHRITT 3 ===
# 9. Model-Code wiederherstellen (unique=True + save() Methode)
```

---

## Wichtige Docker-Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `docker-compose up -d` | Container im Hintergrund starten |
| `docker-compose down` | Container stoppen |
| `docker-compose ps` | Container-Status anzeigen |
| `docker-compose logs django` | Django-Logs anzeigen |
| `docker-compose exec django python manage.py shell` | Django-Shell öffnen |
| `docker-compose exec django bash` | Bash im Container öffnen |

---

## Zusammenfassung der Migrationsdateien

Nach diesem Prozess hast du folgende saubere Struktur:

```
app/imperium/migrations/
├── __init__.py
├── 0001_initial.py          # Original
├── 0002_cls_imperiumscan.py  # Original
├── 0003_add_m_color_temp.py  # Data Migration (RunPython)
└── 0004_add_unique_to_m_color.py  # unique=True hinzugefügt
```

Die **Data Migration** (`0003`) ist klar dokumentiert und jederzeit nachvollziehbar!

---

## Troubleshooting

### Falls SCHRITT 1-2 bereits ohne Data Migration ausgeführt wurde:

```bash
# Letzte Migration rückgängig machen
docker-compose exec django python manage.py migrate imperium 0002_cls_imperiumscan

# Dann von vorne beginnen mit SCHRITT 1
```

### Falls unique-constraint Fehler in SCHRITT 2:

```bash
# Prüfen ob Duplikate existieren
docker-compose exec django python manage.py shell -c "
from imperium.models import cls_imperium
from collections import Counter
colors = cls_imperium.objects.values_list('m_color', flat=True)
duplicates = [c for c, count in Counter(colors).items() if count > 1]
if duplicates:
    print('Duplikate gefunden:', duplicates)
else:
    print('Keine Duplikate - unique=True Migration sollte funktionieren')
"
```

