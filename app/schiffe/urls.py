from django.urls import path
from . import views


app_name = 'schiffe'
urlpatterns = [
    path('api/schiffe/<int:sectorID>/', views.get_sector_fleet_details_json, name='fleet-details'),
]
