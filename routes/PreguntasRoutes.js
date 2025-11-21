const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.get('/:encuestaId', async (req, res) => {
  try {
    const { encuestaId } = req.params;
    const snapshot = await admin
      .firestore()
      .collection('encuestas')
      .doc(encuestaId)
      .collection('preguntas')
      .get();

    const preguntas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(preguntas);
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    res.status(500).send('Error al obtener preguntas: ' + error.message);
  }
});

router.post('/:encuestaId', async (req, res) => {
  try {
    const { encuestaId } = req.params;
    const nuevaPregunta = req.body;

    const ref = await admin
      .firestore()
      .collection('encuestas')
      .doc(encuestaId)
      .collection('preguntas')
      .add(nuevaPregunta);

    res.status(201).json({ id: ref.id, ...nuevaPregunta });
  } catch (error) {
    console.error('Error al crear la pregunta:', error);
    res.status(500).send('Error al crear la pregunta: ' + error.message);
  }
});

module.exports = router;