// Gráfico circular de resultados

let rawData = document.getElementById('data-resultados').textContent.trim();

rawData = rawData
  .replaceAll("'", '"')
  .replace(/(\r\n|\n|\r)/gm, "")
  .trim();

try {
  const resultados = JSON.parse(rawData);
  const labels = Object.keys(resultados);
  const data = Object.values(resultados);

  if (labels.length > 0) {
    const ctx = document.getElementById('graficoResultados');

    new Chart(ctx, {
      type: 'pie', 
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#0d6efd', '#198754', '#ffc107', '#dc3545',
            '#6f42c1', '#20c997', '#fd7e14'
          ],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Distribución de votos por opción'
          }
        }
      }
    });
  }
} catch (error) {
  console.error('Error al procesar los resultados:', error);
  console.log('Datos recibidos:', rawData);
}