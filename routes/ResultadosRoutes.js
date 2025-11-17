const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.get('/:encuestaId/:preguntaId', async (req, res) => {
  try {
    const { encuestaId, preguntaId } = req.params;

    const snapshot = await admin
      .firestore()
      .collection('encuestas')
      .doc(encuestaId)
      .collection('preguntas')
      .doc(preguntaId)
      .collection('votos')
      .get();

    if (snapshot.empty) {
      return res.status(200).json({ mensaje: 'No hay votos registrados aún.', resultados: {} });
    }

    const conteo = {};

    snapshot.docs.forEach(doc => {
      const voto = doc.data();
      const opcion = voto.opcion || 'Sin opción';
      conteo[opcion] = (conteo[opcion] || 0) + 1;
    });

    res.status(200).json({
      preguntaId,
      totalVotos: snapshot.size,
      resultados: conteo,
    });
  } catch (error) {
    console.error('Error al obtener resultados:', error);
    res.status(500).send('Error al obtener resultados: ' + error.message);
  }
});

module.exports = router;