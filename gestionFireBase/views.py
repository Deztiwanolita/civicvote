import requests
from django.shortcuts import render

def obtener_datos_api(request):
    url = 'http://localhost:3000/api/encuestas'
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()          
        datos = response.json()
    except Exception as e:
        print(f'Error al conectar con la API: {e}')
        datos = []
    return render(request, 'myapp/index.html', {'datos': datos})

def listar_preguntas(request, encuesta_id):
    url = f'http://localhost:3000/api/preguntas/{encuesta_id}'
    try:
        response = requests.get(url)
        preguntas = response.json()
    except Exception as e:
        preguntas = {"error": f"No se pudieron obtener las preguntas: {e}"}
    return render(request, 'myapp/preguntas.html', {
        'preguntas': preguntas,
        'encuesta_id': encuesta_id
    })


def votar(request, encuesta_id, pregunta_id):
    if request.method == 'POST':
        opcion = request.POST.get('opcion')
        data = {'opcion': opcion}
        url = f'http://localhost:3000/api/votos/{encuesta_id}/{pregunta_id}'
        try:
            requests.post(url, json=data)
        except Exception as e:
            print(f'Error al enviar voto: {e}')
        return redirect('ver_resultados', encuesta_id=encuesta_id, pregunta_id=pregunta_id)
    else:
        url = f'http://localhost:3000/api/preguntas/{encuesta_id}'
        response = requests.get(url)
        preguntas = response.json()
        pregunta = next((p for p in preguntas if p['id'] == pregunta_id), None)
        return render(request, 'myapp/votar.html', {'pregunta': pregunta, 'encuesta_id': encuesta_id})


def ver_resultados(request, encuesta_id, pregunta_id):
    url = f'http://localhost:3000/api/resultados/{encuesta_id}/{pregunta_id}'
    try:
        response = requests.get(url)
        data = response.json()
    except Exception as e:
        data = {"error": f"No se pudieron obtener los resultados: {e}"}
    return render(request, 'myapp/resultados.html', {'resultados': data})
 