import random
from django.db import migrations, models


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

