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
    
    
    def __str__(self):
        return self.m_name


class cls_rassen(models.Model):
    m_name = models.CharField(max_length=100, unique=True)
       
    
class cls_diplomatie(models.Model):
    m_imperium_1 = models.ForeignKey('cls_imperium', on_delete=models.CASCADE, blank=True, null=True, related_name='imperium_1')
    m_imperium_2 = models.ForeignKey('cls_imperium', on_delete=models.CASCADE, blank=True, null=True, related_name='imperium_2')
    
    status = models.CharField(
        max_length=2,
        choices=cls_diplomatieabkommen.choices,
        default=cls_diplomatieabkommen.NEUTRAL
    )
    
    class Meta:
        unique_together = ("m_imperium_1", "m_imperium_2")  # verhindert doppelte Einträge
        
        
    def __str__(self):
        return f"{self.m_imperium_1} ↔ {self.m_imperium_2}: {self.get_status_display()}"
        
        
class cls_ImperiumScan(models.Model):
    m_imperium = models.ForeignKey(cls_imperium, related_name='imperium', on_delete=models.CASCADE)
    m_sektor = models.ForeignKey('karte.cls_Sektor', on_delete=models.CASCADE, blank=False, null=False, related_name='sektor')

    m_alpha_wert = models.SmallIntegerField(default=0)
    m_beta_wert = models.SmallIntegerField(default=0)
    m_gamma_wert = models.SmallIntegerField(default=0)
    
    