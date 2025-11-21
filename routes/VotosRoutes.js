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

    const votos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(votos);
  } catch (error) {
    console.error('Error al obtener votos:', error);
    res.status(500).send('Error al obtener votos: ' + error.message);
  }
});

router.post('/:encuestaId/:preguntaId', async (req, res) => {
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

    res.status(201).json({ id: ref.id, ...voto });
  } catch (error) {
    console.error('Error al registrar el voto:', error);
    res.status(500).send('Error al registrar el voto: ' + error.message);
  }
});

module.exports = router;