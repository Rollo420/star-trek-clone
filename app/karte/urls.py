from django.urls import path
from . import views

app_name = 'karte'
urlpatterns = [
    path('', views.map_view, name='index'),
    path('map/', views.map_view, name='map'),
        
    path('map-data-json/', views.map_data_json, name='map_data_json'),
    path('fetch_map_model/', views.fetch_map_model, name='fetch_map_model'),
    path('sector/<int:sektor_id>/json/', views.sector_detail_json, name='sector_detail_json'),
]
