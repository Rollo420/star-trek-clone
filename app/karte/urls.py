from django.urls import path
from . import views

app_name = 'karte'
urlpatterns = [
    path('', views.index, name='index'),
    path('map/', views.map_view, name='map'),
    
    
    path('fetch_map_model/', views.fetch_map_model, name='fetch_map_model'),
]