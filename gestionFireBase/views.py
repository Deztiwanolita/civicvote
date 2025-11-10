import requests
from django.shortcuts import render

def obtener_datos_api(request):
    datosEncuestas = 'http://10.66.225.246:3000/'
    
    response = requests.get(datosEncuestas)
    
    if response.status_code == 200:
        datos = response.json()
    else:
        datos = {'error': 'No se pudieron obtener los datos de la API.'}
    
    return render(request, 'myapp/index.html', {'datos': datos})

