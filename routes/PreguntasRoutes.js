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
    console.error('Error al obtener preguntas:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:encuestaId', async (req, res) => {
  try {
    const { encuestaId } = req.params;
    const data = req.body;

    if (!data.texto) {
      return res.status(400).json({ error: 'El campo "texto" es obligatorio.' });
    }

    const ref = await admin
      .firestore()
      .collection('encuestas')
      .doc(encuestaId)
      .collection('preguntas')
      .add(data);

    res.status(201).json({ id: ref.id, ...data });
  } catch (error) {
    console.error('Error al crear pregunta:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;