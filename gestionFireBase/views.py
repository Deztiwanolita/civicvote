import csv
import requests
from django.http import HttpResponse
from django.contrib import messages
from django.shortcuts import render, redirect

def get_auth_headers(request):
    token = request.COOKIES.get('token')
    if token:
        return {"Authorization": f"Bearer {token}"}
    return {}  # sin token (rutas públicas)


def obtener_datos_api(request):
    url = 'http://localhost:3000/api/encuestas'
    try:
        response = requests.get(url, timeout=5, headers=get_auth_headers(request))
        response.raise_for_status()
        datos = response.json()
    except Exception as e:
        print(f'Error al conectar con la API: {e}')
        datos = []
    return render(request, 'myapp/index.html', {'datos': datos})

def listar_preguntas(request, encuesta_id):
    url = f'http://localhost:3000/api/preguntas/{encuesta_id}'
    try:
        response = requests.get(url, headers=get_auth_headers(request))
        response.raise_for_status()
        preguntas = response.json()
    except Exception as e:
        preguntas = {"error": f"No se pudieron obtener las preguntas: {e}"}
    return render(request, 'myapp/preguntas.html', {'preguntas': preguntas, 'encuesta_id': encuesta_id})

def votar(request, encuesta_id, pregunta_id):
    if request.method == 'POST':
        opcion = request.POST.get('opcion')
        data = {'opcion': opcion}
        url = f'http://localhost:3000/api/votos/{encuesta_id}/{pregunta_id}'
        try:
            requests.post(url, json=data, headers=get_auth_headers(request))
        except Exception as e:
            print(f'Error al enviar voto: {e}')
        return redirect('ver_resultados', encuesta_id=encuesta_id, pregunta_id=pregunta_id)
    else:
        url = f'http://localhost:3000/api/preguntas/{encuesta_id}'
        try:
            response = requests.get(url, headers=get_auth_headers(request))
            response.raise_for_status()
            preguntas = response.json()
            pregunta = next((p for p in preguntas if p['id'] == pregunta_id), None)
        except Exception as e:
            pregunta = {"error": f"No se pudo cargar la pregunta: {e}"}
        return render(request, 'myapp/votar.html', {'pregunta': pregunta, 'encuesta_id': encuesta_id})


def ver_resultados(request, encuesta_id, pregunta_id):
    url = f'http://localhost:3000/api/resultados/{encuesta_id}/{pregunta_id}'
    try:
        response = requests.get(url)  # ruta pública
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        data = {"error": f"No se pudieron obtener los resultados: {e}"}

    return render(
        request,
        'myapp/resultados.html',
        {'resultados': data, 'encuesta_id': encuesta_id, 'pregunta_id': pregunta_id},
    )


def exportar_csv(request, encuesta_id, pregunta_id):
    url = f'http://localhost:3000/api/resultados/{encuesta_id}/{pregunta_id}'
    response = requests.get(url)  # exportación de resultados, pública
    data = response.json()

    response_csv = HttpResponse(content_type='text/csv')
    response_csv['Content-Disposition'] = 'attachment; filename="resultados.csv"'

    writer = csv.writer(response_csv)
    writer.writerow(['Opción', 'Votos'])
    for opcion, cantidad in data['resultados'].items():
        writer.writerow([opcion, cantidad])
    writer.writerow([])
    writer.writerow(['Total votos', data.get('totalVotos', 0)])

    return response_csv


def editar_encuesta(request, encuesta_id):
    url = f'http://localhost:3000/api/encuestas/{encuesta_id}'

    if request.method == 'POST':
        nuevo_titulo = request.POST.get('titulo')
        nueva_descripcion = request.POST.get('descripcion')
        data = {'titulo': nuevo_titulo, 'descripcion': nueva_descripcion}

        try:
            response = requests.put(url, json=data, headers=get_auth_headers(request))
            response.raise_for_status()
            messages.success(request, 'Encuesta actualizada correctamente.')
        except Exception as e:
            messages.error(request, f'Error al actualizar la encuesta: {e}')

        return redirect('home')

    try:
        response = requests.get('http://localhost:3000/api/encuestas', headers=get_auth_headers(request))
        response.raise_for_status()
        encuestas = response.json()
        encuesta = next((e for e in encuestas if e["id"] == encuesta_id), None)
    except Exception as e:
        encuesta = {"error": f"No se pudo cargar la encuesta: {e}"}

    return render(request, 'myapp/editar_encuesta.html', {'encuesta': encuesta})

def eliminar_encuesta(request, encuesta_id):
    url = f'http://localhost:3000/api/encuestas/{encuesta_id}'
    try:
        requests.delete(url, headers=get_auth_headers(request))
        messages.success(request, 'Encuesta eliminada correctamente.')
    except Exception as e:
        messages.error(request, f'Error al eliminar la encuesta: {e}')
    return redirect('home')

def login_view(request):
    return render(request, 'myapp/login.html')