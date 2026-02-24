
-----

## 💻 Bootstrap 5 & CSS in Django einbinden

Dieses Dokument führt dich durch die Schritte, um Bootstrap 5 und eine eigene CSS-Datei in deinem Django-Projekt zu integrieren.

### 1\. Vorbereitung ⚙️

Stelle sicher, dass du das Paket `django-bootstrap5` installiert hast. Wenn nicht, führe diesen Befehl aus:

```bash
pip install django-bootstrap5
```

Danach musst du `bootstrap5` zu deinen `INSTALLED_APPS` in der `settings.py`-Datei deines Projekts hinzufügen:

```python
# settings.py
INSTALLED_APPS = [
    # ... andere Apps ...
    'bootstrap5',
]
```

-----

### 2\. Ordnerstruktur anlegen 📂

Lege im Verzeichnis deines Moduls (`modul_folder`) einen `static`-Ordner an. In diesem Ordner speicherst du deine statischen Dateien, wie zum Beispiel deine eigene CSS-Datei (`app.css`).

Die Struktur sollte so aussehen:

```
main_folder/
├── modul_folder/
│   ├── static/
│   │   └── app.css
│   ├── templates/
│   │   └── modul_folder/
│   │       └── base.html
│   └── ... weitere Dateien und Ordner
├── manage.py
└── ... weitere Projektdateien
```

-----

### 3\. Bootstrap und CSS in `base.html` laden 🔗

Öffne deine Basis-HTML-Datei (`base.html`) im `templates`-Ordner. Lade ganz oben die benötigten statischen Dateien und das `bootstrap5`-Modul.

Füge dann in den `<head>`-Bereich die CSS- und JavaScript-Dateien von Bootstrap und deine eigene CSS-Datei hinzu.

**Wichtig**: Lade deine eigene CSS-Datei (`app.css`) **nach** den Bootstrap-Dateien. Dadurch überschreibst du Bootstrap-Styles mit deinen eigenen, falls es zu Konflikten kommt.

```html
{% load static %}
{% load bootstrap5 %}

<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meine Django-App</title>

    {# Bootstrap 5 CSS #}
    {% bootstrap_css %}

    {# Bootstrap 5 JavaScript #}
    {% bootstrap_javascript %}

    {# Eigene CSS-Datei nach Bootstrap laden #}
    <link rel="stylesheet" href="{% static 'app.css' %}">

    {# Zusätzliche Meta-Tags, Titel etc. #}
</head>
<body>
    {# Der Rest deines HTML-Codes #}
</body>
</html>
```

-----

### 4\. Verwendung in HTML-Dateien ✨

Deine anderen HTML-Dateien können nun `base.html` erweitern, um die geladenen Styles und Skripte zu nutzen.

Zum Beispiel in deiner `base.html`:

```html
{% extends 'modul_folder/base.html' %}

{% block content %}
    <div class="container mt-5">
        <h1 class="text-primary">Hallo Welt mit Bootstrap!</h1>
        <p>Dies ist ein Beispiel für einen Bootstrap-Container.</p>
        <button class="btn btn-success">Ein grüner Button</button>
    </div>
{% endblock %}
```

Deine **Bootstrap-Klassen** (`container`, `text-primary`, `btn`, `btn-success`) stehen dir jetzt in allen Templates zur Verfügung, die von `base.html` erben.

---

## 📝 Logging-System

Dieses Projekt verfügt über ein zentrales Logging-System, das Nachrichten sowohl in der Konsole als auch in eine Log-Datei schreibt.

### Datei

Das Logging-Modul befindet sich unter: `app/karte/logger.py`

### Import

```python
from app.karte.logger import debug, info, warning, error, critical, exception, logger
```

### Verfügbare Funktionen

| Funktion | Beschreibung |
|----------|--------------|
| `debug(message, error_type=None)` | Debug-Nachrichten |
| `info(message, error_type=None)` | Informationsnachrichten |
| `warning(message, error_type=None)` | Warnungen |
| `error(message, error_type=None)` | Fehler |
| `critical(message, error_type=None)` | Kritische Fehler |
| `exception(message, error_type=None)` | Exceptions mit Stacktrace |

Der optionale `error_type` Parameter ermöglicht die Kategorisierung von Meldungen.

### Log-Datei

Alle Nachrichten werden in folgende Datei geschrieben: `app/logs/app.log`

### Konsolen-Format (ohne Datum)

```
LEVELNAME | Nachricht
```

### Datei-Format (mit Datum und Zeit)

```
YYYY-MM-DD HH:MM:SS | LEVELNAME | Nachricht
```

### Verwendung

```python
from app.karte.logger import info, error

# Einfache Nachricht
info("Planet wurde erfolgreich erstellt")

# Mit Fehlertyp
error("Datenbankverbindung fehlgeschlagen", error_type="DATABASE")

# Exception mit Stacktrace
try:
    x = 1 / 0
except Exception:
    exception("Ein Fehler ist aufgetreten")
```

### Logger direkt verwenden

Du kannst auch den Logger direkt importieren und nutzen:

```python
from app.karte.logger import logger

logger.info("Direkte Logger-Verwendung")
logger.debug("Debug-Meldung")
```
