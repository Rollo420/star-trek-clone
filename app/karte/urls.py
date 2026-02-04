from django.urls import path
from . import views

app_name = 'karte'
urlpatterns = [
    path('', views.map_view, name='index'),
    path('map/', views.map_view, name='map'),
<<<<<<< HEAD
    

=======
        
>>>>>>> 3a9a69f1cc74426b975c2dcf5c3ffce6205cd0b9
    path('fetch_map_model/', views.fetch_map_model, name='fetch_map_model'),
    path('sector/<int:sektor_id>/json/', views.sector_detail_json, name='sector_detail_json'),
]
