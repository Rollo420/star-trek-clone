from django.db import models
import random
import json
from imperium.models import cls_imperium, cls_diplomatie, cls_rassen
from karte.models import cls_sektor, cls_galaxy
from module.models import cls_Modularten
#from module.models import cls_Module
from django.db.models import Q
from random import randrange
from django.utils.functional import cached_property

class cls_flotte(models.Model):
    m_name = models.CharField(max_length=100)

class cls_schiffe(models.Model):
    m_name = models.CharField(max_length=100)

    m_rasse = models.ForeignKey('imperium.cls_rassen', on_delete=models.CASCADE, blank=True, null=True, related_name='Rasse')
    m_klasse = models.ForeignKey('cls_schiffsklassen', on_delete=models.CASCADE, blank=True, null=True, related_name='Klasse')
    m_imperium = models.ForeignKey('imperium.cls_imperium', on_delete=models.CASCADE, blank=True, null=True, related_name='Imperium')
    
    m_flotte = models.ForeignKey('cls_flotte', on_delete=models.SET_NULL, blank=True, null=True, related_name='Flotte')
    
    m_imgname = models.CharField(max_length=100)   

    m_istPos = models.ForeignKey('karte.cls_Sektor', on_delete=models.CASCADE, blank=False, null=False, related_name='istPos')
    m_sollPos = models.CharField(max_length=250, blank=True, null=True)

    #m_crew = models.ForeignKey('personal.cls_crew', on_delete=models.SET_NULL, blank=True, null=True, related_name='Crew')

    m_versorgungsgueter = models.PositiveIntegerField(default=0)
    
    
    ### Aktuelle Schiffswerte
    m_akt_warp = models.PositiveIntegerField(default=0)
    
    ### Aktuelle Kampfwerte
    m_akt_hitpoints = models.IntegerField(default=0)
    m_akt_schilde = models.IntegerField(default=0) #art steckt im modul        
    m_akt_ruestungsklasse = models.PositiveIntegerField(default=0)
   


    m_getarnt = models.BooleanField(default=False)
    m_tarnart = models.IntegerField(default=0)
    m_akt_tarnstufe_alpha = models.IntegerField(default=0) # art steckt im modul
    m_akt_tarnstufe_beta = models.IntegerField(default=0)
    m_akt_tarnstufe_gamma = models.IntegerField(default=0)
    
    ### Module
    m_warpkern = models.ForeignKey('module.cls_Module', on_delete=models.SET_NULL, blank=True, null=True, related_name='warpkern')

    m_schilde = models.ForeignKey('module.cls_Module', on_delete=models.SET_NULL, blank=True, null=True, related_name='schilde')

    m_deflektor = models.ForeignKey('module.cls_Module', on_delete=models.SET_NULL, blank=True, null=True, related_name='deflektor')
    
    m_sensor = models.ForeignKey('module.cls_Module', on_delete=models.SET_NULL, blank=True, null=True, related_name='sensor')
    
    m_impulsantrieb = models.ForeignKey('module.cls_Module', on_delete=models.SET_NULL, blank=True, null=True, related_name='impulsantrieb')

    m_konsole = models.ManyToManyField('module.cls_Module', related_name='m_konsole')

    m_strahlenwaffen = models.ManyToManyField('module.cls_Module', related_name='m_strahlenwaffen')
    m_torpedo = models.ManyToManyField('module.cls_Module', related_name='m_torpedo')

    m_akt_sensorenwert_alpha = models.FloatField(default=0) 
    m_akt_sensorenwert_beta = models.FloatField(default=0) 
    m_akt_sensorenwert_gamma = models.FloatField(default=0)
    m_akt_reichweite = models.IntegerField(default=0)    

    # -------------------------------------------------------------------
    def set_sollpos(self, x):
        self.m_sollPos = json.dumps(x)
    # -------------------------------------------------------------------
    def get_sollpos(self):
        if self.m_sollPos:
            return json.loads(self.m_sollPos)
        else:
            return self.m_sollPos
    #-------------------------------------------------------------------
    def getBeschreibung(self):
        return ""


#-------------------------------------------------------------------
class cls_schiffskategorie(models.Model):
    m_name = models.CharField(max_length=100)
    m_value = models.IntegerField(default=1)
    
    def __str__(self):
        return self.m_name
        
    @classmethod
    def get_default_pk(cls):
        exam, created = cls.objects.get_or_create(
            m_name='Kriegsschiff', 
            m_value=100,
        )
        return exam.pk
#-------------------------------------------------------------------
class cls_schiffsklassen(models.Model):
    m_name = models.CharField(max_length=100)
    
    m_schiffskategorie = models.ForeignKey('schiffe.cls_schiffskategorie', on_delete=models.SET_DEFAULT, default=cls_schiffskategorie.get_default_pk, blank=True, null=True, related_name='Kategorie')
       
    m_maxwarp = models.IntegerField(default=1)
    m_hitpoint = models.IntegerField()
    m_konsolenanzahl = models.IntegerField()
    m_torpedoanzahl = models.IntegerField()
    m_strahlenwaffenanzahl = models.IntegerField()
    
    m_maxwarp = models.IntegerField(default=1)
    m_basisruestungsklasse = models.IntegerField(default=10)

