from django.contrib import admin
from django.urls import path
from gestionFireBase import views

urlpatterns = [
    path('', views.obtener_datos_api, name='home'),
]

