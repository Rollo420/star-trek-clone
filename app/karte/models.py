from django.db import models
from django.shortcuts import get_object_or_404


class cls_galaxy:
    m_sizex = 180
    m_sizey = 180

class cls_sektor(models.Model):
    m_x = models.PositiveIntegerField()
    m_y = models.PositiveIntegerField()
    m_sektorobjekt = models.ForeignKey('cls_sektorobjekt', on_delete=models.SET_NULL, blank=True, null=True)
    m_subraumenergielevel = models.PositiveIntegerField(default=0)
    
    m_cx = models.IntegerField(null=False, default = 0)
    m_cy = models.IntegerField(null=False, default = 0)
    m_cz = models.IntegerField(null=False, default = 0)
        

    def save(self, *args, **kwargs):
        self.m_cx = self.m_x
        self.m_cz = self.m_y - (self.m_x // 2)
        self.m_cy = -self.m_cx - self.m_cz

        super().save(*args, **kwargs)

    def isvoll(self):
        #print(self.m_sektorobjekt)
        if self.m_sektorobjekt != None:
            return True
        else:
            return False

    def getSonnenSystem(self):
        if self.m_sektorobjekt is not None:
            sektorobjekt = get_object_or_404(cls_sektorobjekt, id=self.m_sektorobjekt.id)
            #print(sektorobjekt)
            return sektorobjekt.m_Art
        return 0
        

class cls_sektorobjekt(models.Model):
    m_art = models.PositiveIntegerField()

