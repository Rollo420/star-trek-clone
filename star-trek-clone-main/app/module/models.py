from django.db import models
# Create your models here.

  
class cls_Modul_Library(models.Model):
    m_name = models.CharField(max_length=100)
    m_modul_art = models.ForeignKey('cls_Modularten', on_delete=models.CASCADE, blank=False, null=False)

    m_subraumenergieoffset = models.IntegerField(default=0)

    ### basics
    
    m_schildwert = models.IntegerField(default=0)
    m_schildbonusfaktor = models.FloatField(default=0)
    
    m_energieverbrauch = models.IntegerField(default=0) 
    m_energieproduktion = models.IntegerField(default=0) 
    m_energieproduktionfaktor = models.FloatField(default=0)

    m_warpbonusabsolut = models.IntegerField(default=0)
    m_warpbonusfaktor = models.FloatField(default=0)

    m_initiative = models.IntegerField(default=0)
    m_initiativebonusfaktor = models.FloatField(default=0)

    m_angriffswert = models.IntegerField(default=0)
    m_angriffswertbonusfaktor = models.FloatField(default=0)
    
    m_schadenswert = models.IntegerField(default=0)
    m_schadenswertbonusfaktor = models.FloatField(default=0)

    m_ruestungsklasseabsolut = models.IntegerField(default=0)
    m_ruestungsklassebonusfaktor = models.FloatField(default=0)

    m_scannerwert = models.IntegerField(default=0)
    m_scannerwertbonusfaktor = models.FloatField(default=0)
    m_scannerreichweite = models.PositiveIntegerField(default=0)
    m_scannerreichweitebonusfaktor =  models.FloatField(default=0)
    
    m_versorgungsgueterkosten = models.PositiveIntegerField(default=0)
    
    m_tarnungswert = models.IntegerField(default=0)
    m_tarnungswertbonusfaktor = models.FloatField(default=0)

    m_alphawert = models.FloatField(default=1)
    m_betawert = models.FloatField(default=1)
    m_gammawert = models.FloatField(default=1)
    m_technologieart = models.IntegerField(default=0) #Alpha: 0, Beta 1, Gamma 2
 
    
class cls_Modularten(models.Model):
    m_name = models.CharField(max_length=100)
    m_art = models.IntegerField() 
    
    def __str__(self):
        return self.m_name

class cls_Module(models.Model):
    m_modul_library = models.ForeignKey('cls_Modul_Library', on_delete=models.CASCADE, blank=False, null=False)
    m_energie = models.IntegerField(default=100) # Lebenspunkte
    m_deathcount = models.IntegerField(default=0)
    m_abschaltpriro = models.IntegerField(default=0)
    m_aktiv = models.BooleanField(default=True)
    m_versorgt = models.BooleanField(default=False) #wurde mit versorgungsgueter versorgt
           
    
