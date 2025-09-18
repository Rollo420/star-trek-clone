from django.urls import path
from . import views

app_name = 'karte'
urlpatterns = [
    path('', views.index, name='index'),
]