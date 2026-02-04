# TODO - get_sector_info Script-Korrekturen

## Geplante Änderungen:
- [x] 1. base.html: Falschen Script-Pfad korrigieren (static template tag verwenden)
- [x] 2. base.html: Script-Aufruf hinzufügen
- [x] 3. views.py: request Parameter bei test_js_fetch() hinzufügen
- [x] 4. get_sector_infos.js: Funktionsname korrigieren

## Status:
- [ ] Offen
- [ ] In Bearbeitung
- [x] Abgeschlossen

## Zusammenfassung der Änderungen:
- base.html: Script-Tag von `../../static/js/get_sector_info.js` zu `{% static 'js/get_sector_infos.js' %}` geändert
- base.html: "Next Turn" Button erhält `onclick="getSectorInfos()"`
- base.html: "Map" Button erhält `onclick="getSectorInfos()"`
- views.py: `test_js_fetch()` erhält jetzt den `request` Parameter
- get_sector_infos.js: Funktionsname von `getSectoInfos()` zu `getSectorInfos()` korrigiert

