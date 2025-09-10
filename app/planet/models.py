from django.db import models
from imperium.models import cls_imperium
from karte.models import cls_sektor, cls_galaxy


class cls_planet(models.Model):
    m_sektor = models.ForeignKey('karte.cls_sektor', on_delete=models.CASCADE, blank=False, null=False)
    m_position = models.PositiveIntegerField(default=0)
    m_name = models.CharField(max_length=100)
    m_klasse = models.ForeignKey('cls_planetenklasse', on_delete=models.CASCADE, blank=False, null=False)
    m_bevoelkerung = models.PositiveIntegerField(default=0)
    m_besitzer = models.ForeignKey('imperium.cls_imperium', default=None,  on_delete=models.SET_NULL, blank=False, null=True)
    m_anbauzone = models.PositiveIntegerField(default=0)
    m_heimatplanet = models.BooleanField(default=False)
  
  
class cls_planetenklasse(models.Model):
    m_klasse = models.CharField(max_length=2, unique=True)  
    m_typ = models.CharField(max_length=50)  
    m_frequenz = models.PositiveIntegerField(help_text="Häufigkeit in Prozent")

    # Rohstoffe als Boolesche Felder
    m_titan = models.BooleanField(default=False)
    m_deuterium = models.BooleanField(default=False)
    m_duranium = models.BooleanField(default=False)
    m_kristall = models.BooleanField(default=False)
    m_iridium = models.BooleanField(default=False)
    m_dilithium = models.BooleanField(default=False)

    m_bewohnbarkeit = models.CharField(max_length=50)  
    m_beschreibung = models.TextField()

    class Meta:
        verbose_name = "Planetenklasse"
        verbose_name_plural = "Planetenklassen"
        ordering = ["m_klasse"]

    def __str__(self):
        return f"Klasse {self.m_klasse} ({self.m_typ})"