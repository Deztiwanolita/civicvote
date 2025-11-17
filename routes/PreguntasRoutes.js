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

    const preguntas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(preguntas);
  } catch (error) {
    res.status(500).send('Error al obtener las preguntas: ' + error.message);
  }
});

router.post('/:encuestaId', async (req, res) => {
  try {
    const { encuestaId } = req.params;
    const pregunta = req.body;

    const ref = await admin
      .firestore()
      .collection('encuestas')
      .doc(encuestaId)
      .collection('preguntas')
      .add(pregunta);

    res.status(201).json({ id: ref.id, ...pregunta });
  } catch (error) {
    res.status(500).send('Error al agregar la pregunta: ' + error.message);
  }
});

module.exports = router;