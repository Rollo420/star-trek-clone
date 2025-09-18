
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