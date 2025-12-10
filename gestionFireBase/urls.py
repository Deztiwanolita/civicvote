from django.urls import path
from . import views

urlpatterns = [
    path('', views.obtener_datos_api, name='home'),
    path('preguntas/<str:encuesta_id>/', views.listar_preguntas, name='listar_preguntas'),
    path('votar/<str:encuesta_id>/<str:pregunta_id>/', views.votar, name='votar'),
    path('resultados/<str:encuesta_id>/<str:pregunta_id>/', views.ver_resultados, name='ver_resultados'),
    path('exportar/<str:encuesta_id>/<str:pregunta_id>/', views.exportar_csv, name='exportar_csv'),
    path('editar/<str:encuesta_id>/', views.editar_encuesta, name='editar_encuesta'),
path('eliminar/<str:encuesta_id>/', views.eliminar_encuesta, name='eliminar_encuesta'),
]