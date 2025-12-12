import csv
import requests
from datetime import datetime
from django.http import HttpResponse
from django.contrib import messages
from django.shortcuts import render, redirect

# --- Helpers ---

def get_auth_headers(request):
    """Obtiene el token de la cookie para peticiones protegidas"""
    token = request.COOKIES.get('token')
    if token:
        return {"Authorization": f"Bearer {token}"}
    return {}

# --- Vistas ---

def obtener_datos_api(request):
    """Vista del Home (Lista de encuestas)"""
    url = 'http://localhost:3000/api/encuestas'
    try:
        # Enviamos headers por si la API requiere auth para listar
        response = requests.get(url, timeout=5, headers=get_auth_headers(request))
        response.raise_for_status()
        datos = response.json()
    except Exception as e:
        print(f'Error al conectar con la API: {e}')
        datos = []
    return render(request, 'myapp/index.html', {'datos': datos})

def crear_encuesta(request):
    """Lógica para crear una nueva encuesta (FALTABA ESTO)"""
    if request.method == 'POST':
        titulo = request.POST.get('titulo')
        descripcion = request.POST.get('descripcion')
        opciones_raw = request.POST.getlist('opcion') # Captura multiples inputs con mismo nombre

        # Limpiamos opciones vacías
        opciones_limpias = [op.strip() for op in opciones_raw if op.strip()]

        if len(opciones_limpias) < 2:
            messages.error(request, "Debes agregar al menos 2 opciones.")
            return render(request, 'myapp/crear_encuesta.html')

        # Estructura que espera Node.js
        lista_opciones = [{"texto": texto, "votos": 0} for texto in opciones_limpias]

        data = {
            "titulo": titulo,
            "descripcion": descripcion,
            "opciones": lista_opciones,
            "fechaCreacion": str(datetime.now())
        }

        try:
            url = 'http://localhost:3000/api/encuestas'
            requests.post(url, json=data, headers=get_auth_headers(request))
            messages.success(request, '¡Encuesta creada con éxito!')
            return redirect('home')
        except Exception as e:
            messages.error(request, f'Error al crear encuesta: {e}')

    return render(request, 'myapp/crear_encuesta.html')

def listar_preguntas(request, encuesta_id):
    url = f'http://localhost:3000/api/encuestas/{encuesta_id}'
    
    try:
        response = requests.get(url, headers=get_auth_headers(request))
        response.raise_for_status()
        # 'data' contiene: titulo, descripcion, opciones, etc.
        data = response.json() 
    except Exception as e:
        data = {"error": f"No se pudo cargar la encuesta: {e}"}

    # Pasamos 'data' al template
    return render(request, 'myapp/preguntas.html', {'preguntas': data, 'encuesta_id': encuesta_id})

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
        # Lógica GET para mostrar formulario de voto (si fuera necesario separado)
        # Por ahora redirige o muestra template similar a listar_preguntas
        return redirect('home')

def ver_resultados(request, encuesta_id, pregunta_id):
    url = f'http://localhost:3000/api/resultados/{encuesta_id}/{pregunta_id}'
    try:
        response = requests.get(url)
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
    """Exportación robusta a CSV (arreglada para no fallar)"""
    url = f'http://localhost:3000/api/resultados/{encuesta_id}/{pregunta_id}'
    
    try:
        response = requests.get(url)
        data = response.json()
    except Exception:
        data = {'resultados': {}, 'totalVotos': 0}

    response_csv = HttpResponse(content_type='text/csv')
    response_csv['Content-Disposition'] = f'attachment; filename="resultados_{encuesta_id}.csv"'
    
    # Escribir BOM para que Excel abra bien las tildes/ñ
    response_csv.write(u'\ufeff'.encode('utf8')) 

    writer = csv.writer(response_csv)
    writer.writerow(['Opción', 'Votos'])
    
    # Manejo seguro de datos (Lista o Diccionario)
    resultados = data.get('resultados', {})
    
    if isinstance(resultados, dict):
        for opcion, cantidad in resultados.items():
            writer.writerow([opcion, cantidad])
    elif isinstance(resultados, list):
        for item in resultados:
            # Adapta esto según cómo devuelva tu API los objetos dentro de la lista
            opcion = item.get('opcion') or item.get('texto') or 'Opción'
            votos = item.get('votos', 0)
            writer.writerow([opcion, votos])

    writer.writerow([])
    writer.writerow(['Total votos', data.get('totalVotos', 0)])

    return response_csv

def editar_encuesta(request, encuesta_id):
    url = f'http://localhost:3000/api/encuestas/{encuesta_id}'

    if request.method == 'POST':
        nuevo_titulo = request.POST.get('titulo')
        nueva_descripcion = request.POST.get('descripcion')
        
        # OJO: Solo enviamos lo que queremos actualizar
        data = {'titulo': nuevo_titulo, 'descripcion': nueva_descripcion}

        try:
            response = requests.put(url, json=data, headers=get_auth_headers(request))
            response.raise_for_status()
            messages.success(request, 'Encuesta actualizada correctamente.')
        except Exception as e:
            messages.error(request, f'Error al actualizar la encuesta: {e}')

        return redirect('home')

    try:
        # Obtenemos la lista para buscar la encuesta específica
        # (Idealmente tu API debería tener un GET /encuestas/:id directo, pero esto funciona)
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

def alternar_estado(request, encuesta_id):
    url_get = f'http://localhost:3000/api/encuestas/{encuesta_id}'
    try:
        resp = requests.get(url_get, headers=get_auth_headers(request))
        data = resp.json()
        
        estado_actual = data.get('activa', True) 
        nuevo_estado = not estado_actual
        
        url_put = f'http://localhost:3000/api/encuestas/{encuesta_id}'
        requests.put(url_put, json={'activa': nuevo_estado}, headers=get_auth_headers(request))
        
        estado_txt = "Activada" if nuevo_estado else "Cerrada"
        messages.success(request, f'Encuesta {estado_txt} correctamente.')
        
    except Exception as e:
        messages.error(request, f'Error al cambiar estado: {e}')
        
    return redirect('home')