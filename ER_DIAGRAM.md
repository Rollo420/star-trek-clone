# ER-Diagramm: Star Trek Django Projekt

## Übersicht der Tabellen und Beziehungen

```mermaid
erDiagram
    %% ========================
    %% KARTE APP
    %% ========================
    
    cls_sektor {
        int id PK
        int m_x
        int m_y
        int m_sektorobjekt FK
        int m_subraumenergielevel
        int m_cx
        int m_cy
        int m_cz
    }
    
    cls_sektorobjekt {
        int id PK
        int m_art
    }
    
    %% ========================
    %% PLANET APP
    %% ========================
    
    cls_planet {
        int id PK
        int m_sektor FK
        int m_position
        str m_name
        int m_klasse FK
        int m_bevoelkerung
        int m_besitzer FK
        int m_anbauzone
        bool m_heimatplanet
    }
    
    cls_planetenklasse {
        int id PK
        str m_klasse
        str m_typ
        int m_frequenz
        bool m_titan
        bool m_deuterium
        bool m_duranium
        bool m_kristall
        bool m_iridium
        bool m_dilithium
        str m_bewohnbarkeit
        txt m_beschreibung
    }
    
    %% ========================
    %% SCHIFFE APP
    %% ========================
    
    cls_flotte {
        int id PK
        str m_name
    }
    
    cls_schiffe {
        int id PK
        str m_name
        int m_rasse FK
        int m_klasse FK
        int m_imperium FK
        int m_flotte FK
        str m_imgname
        int m_istPos FK
        str m_sollPos
        int m_versorgungsgueter
        int m_akt_warp
        int m_akt_hitpoints
        int m_akt_schilde
        int m_akt_ruestungsklasse
        bool m_getarnt
        int m_tarnart
        int m_akt_tarnstufe_alpha
        int m_akt_tarnstufe_beta
        int m_akt_tarnstufe_gamma
        int m_warpkern FK
        int m_schilde FK
        int m_deflektor FK
        int m_sensor FK
        int m_impulsantrieb FK
        float m_akt_sensorenwert_alpha
        float m_akt_sensorenwert_beta
        float m_akt_sensorenwert_gamma
        int m_akt_reichweite
    }
    
    cls_schiffskategorie {
        int id PK
        str m_name
        int m_value
    }
    
    cls_schiffsklassen {
        int id PK
        str m_name
        int m_schiffskategorie FK
        int m_maxwarp
        int m_hitpoint
        int m_konsolenanzahl
        int m_torpedoanzahl
        int m_strahlenwaffenanzahl
        int m_basisruestungsklasse
    }
    
    %% ========================
    %% MODULE APP
    %% ========================
    
    cls_Modularten {
        int id PK
        str m_name
        int m_art
    }
    
    cls_Modul_Library {
        int id PK
        str m_name
        int m_modul_art FK
        int m_subraumenergieoffset
        int m_schildwert
        float m_schildbonusfaktor
        int m_energieverbrauch
        int m_energieproduktion
        float m_energieproduktionfaktor
        int m_warpbonusabsolut
        float m_warpbonusfaktor
        int m_initiative
        float m_initiativebonusfaktor
        int m_angriffswert
        float m_angriffswertbonusfaktor
        int m_schadenswert
        float m_schadenswertbonusfaktor
        int m_ruestungsklasseabsolut
        float m_ruestungsklassebonusfaktor
        int m_scannerwert
        float m_scannerwertbonusfaktor
        int m_scannerreichweite
        float m_scannerreichweitebonusfaktor
        int m_versorgungsgueterkosten
        int m_tarnungswert
        float m_tarnungswertbonusfaktor
        float m_alphawert
        float m_betawert
        float m_gammawert
        int m_technologieart
    }
    
    cls_Module {
        int id PK
        int m_modul_library FK
        int m_energie
        int m_deathcount
        int m_abschaltpriro
        bool m_aktiv
        bool m_versorgt
    }
    
    %% ========================
    %% IMPERIUM APP
    %% ========================
    
    cls_rassen {
        int id PK
        str m_name
    }
    
    cls_imperium {
        int id PK
        str m_name
        int m_rasse FK
    }
    
    cls_diplomatie {
        int id PK
        int m_imperium_1 FK
        int m_imperium_2 FK
        str status
    }
    
    cls_ImperiumScan {
        int id PK
        int m_imperium FK
        int m_sektor FK
        int m_alpha_wert
        int m_beta_wert
        int m_gamma_wert
    }
    
    %% ========================
    %% BEZIEHUNGEN
    %% ========================
    
    %% Karte -> Sektorobjekt
    cls_sektor }o--|| cls_sektorobjekt : "m_sektorobjekt"
    
    %% Planet -> Sektor
    cls_planet }o--|| cls_sektor : "m_sektor"
    
    %% Planet -> Planetenklasse
    cls_planet }o--|| cls_planetenklasse : "m_klasse"
    
    %% Planet -> Imperium
    cls_planet }o--|| cls_imperium : "m_besitzer"
    
    %% Schiffe -> Rasse
    cls_schiffe }o--|| cls_rassen : "m_rasse"
    
    %% Schiffe -> Schiffsklassen
    cls_schiffe }o--|| cls_schiffsklassen : "m_klasse"
    
    %% Schiffe -> Imperium
    cls_schiffe }o--|| cls_imperium : "m_imperium"
    
    %% Schiffe -> Flotte
    cls_schiffe }o--o{ cls_flotte : "m_flotte"
    
    %% Schiffe -> Sektor (istPos)
    cls_schiffe }o--|| cls_sektor : "m_istPos"
    
    %% Schiffsklassen -> Schiffskategorie
    cls_schiffsklassen }o--|| cls_schiffskategorie : "m_schiffskategorie"
    
    %% Module -> Modul_Library
    cls_Module }o--|| cls_Modul_Library : "m_modul_library"
    
    %% Modul_Library -> Modularten
    cls_Modul_Library }o--|| cls_Modularten : "m_modul_art"
    
    %% Schiffe -> Module (verschiedene FKs)
    cls_schiffe }o--|| cls_Module : "m_warpkern"
    cls_schiffe }o--|| cls_Module : "m_schilde"
    cls_schiffe }o--|| cls_Module : "m_deflektor"
    cls_schiffe }o--|| cls_Module : "m_sensor"
    cls_schiffe }o--|| cls_Module : "m_impulsantrieb"
    
    %% Schiffe -> Module (ManyToMany)
    cls_schiffe }o--o{ cls_Module : "m_konsole"
    cls_schiffe }o--o{ cls_Module : "m_strahlenwaffen"
    cls_schiffe }o--o{ cls_Module : "m_torpedo"
    
    %% Imperium -> Rasse
    cls_imperium }o--|| cls_rassen : "m_rasse"
    
    %% Diplomatie -> Imperium (zwei FKs)
    cls_diplomatie }o--|| cls_imperium : "m_imperium_1"
    cls_diplomatie }o--|| cls_imperium : "m_imperium_2"
    
    %% ImperiumScan -> Imperium
    cls_ImperiumScan }o--|| cls_imperium : "m_imperium"
    
    %% ImperiumScan -> Sektor
    cls_ImperiumScan }o--|| cls_sektor : "m_sektor"
```

## Kurzübersicht der Beziehungen

| Von | Zu | Beziehung |
|-----|-----|-----------|
| cls_sektor | cls_sektorobjekt | 1:1 (jeder Sektor hat max. 1 Sektorobjekt) |
| cls_planet | cls_sektor | N:1 (mehrere Planeten pro Sektor) |
| cls_planet | cls_planetenklasse | N:1 |
| cls_planet | cls_imperium | N:1 (Besitzer) |
| cls_schiffe | cls_rassen | N:1 |
| cls_schiffe | cls_schiffsklassen | N:1 |
| cls_schiffe | cls_imperium | N:1 |
| cls_schiffe | cls_flotte | N:1 (oder null) |
| cls_schiffe | cls_sektor (istPos) | N:1 (aktueller Standort) |
| cls_schiffe | cls_Module | N:1 (warpkern, schilde, deflektor, sensor, impulsantrieb) |
| cls_schiffe | cls_Module | N:M (konsole, strahlenwaffen, torpedo) |
| cls_schiffsklassen | cls_schiffskategorie | N:1 |
| cls_Module | cls_Modul_Library | N:1 |
| cls_Modul_Library | cls_Modularten | N:1 |
| cls_imperium | cls_rassen | N:1 |
| cls_diplomatie | cls_imperium | N:2 (Beziehung zwischen 2 Imperien) |
| cls_ImperiumScan | cls_imperium | N:1 |
| cls_ImperiumScan | cls_sektor | N:1 |

## Farbcodierung nach Apps

- 🔵 **karte** (Blau): cls_sektor, cls_sektorobjekt
- 🟢 **planet** (Grün): cls_planet, cls_planetenklasse
- 🟠 **schiffe** (Orange): cls_flotte, cls_schiffe, cls_schiffskategorie, cls_schiffsklassen
- 🟣 **module** (Lila): cls_Modularten, cls_Modul_Library, cls_Module
- 🔴 **imperium** (Rot): cls_rassen, cls_imperium, cls_diplomatie, cls_ImperiumScan

