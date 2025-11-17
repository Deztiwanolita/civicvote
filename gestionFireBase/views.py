import requests
from django.shortcuts import render

#quiza cambiar esto de aca mas adelante la linea de datos encuestas
def obtener_datos_api(request):
    datosEncuestas = 'http://localhost:3000/api/encuestas'
    
    response = requests.get(datosEncuestas)
    
    if response.status_code == 200:
        datos = response.json()
    else:
        datos = {'error': 'No se pudieron obtener los datos de la API.'}
    
    return render(request, 'myapp/index.html', {'datos': datos})

