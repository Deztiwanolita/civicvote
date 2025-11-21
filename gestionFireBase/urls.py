from django.urls import path
from . import views

urlpatterns = [
    path('', views.obtener_datos_api, name='home'),
    path('preguntas/<str:encuesta_id>/', views.listar_preguntas, name='listar_preguntas'),
    path('votar/<str:encuesta_id>/<str:pregunta_id>/', views.votar, name='votar'),
    path('resultados/<str:encuesta_id>/<str:pregunta_id>/', views.ver_resultados, name='ver_resultados'),
]