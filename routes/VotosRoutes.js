const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { FieldValue } = admin.firestore;

function validarVoto(req, res, next) {
  const { opcion } = req.body;
  if (!opcion || opcion.trim() === '') {
    return res
      .status(400)
      .json({ error: 'Debe seleccionar una opción de voto válida.' });
  }
  next();
}

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

    const votos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(votos);
  } catch (error) {
    console.error('Error al obtener votos:', error);
    return res
      .status(500)
      .json({ error: 'Error interno al obtener los votos.' });
  }
});

router.post('/:encuestaId/:preguntaId', validarVoto, async (req, res) => {
  try {
    const { encuestaId, preguntaId } = req.params;
    const voto = req.body;

    voto.timestamp = FieldValue.serverTimestamp();

    const ref = await admin
      .firestore()
      .collection('encuestas')
      .doc(encuestaId)
      .collection('preguntas')
      .doc(preguntaId)
      .collection('votos')
      .add(voto);

    return res.status(201).json({ id: ref.id, ...voto });
  } catch (error) {
    console.error('Error al registrar voto:', error);
    return res
      .status(500)
      .json({ error: 'No se pudo registrar el voto: ' + error.message });
  }
});

module.exports = router;