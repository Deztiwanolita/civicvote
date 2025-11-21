const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.get('/', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('encuestas').get();
    const encuestas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(encuestas);
  } catch (error) {
    console.error('Error al obtener las encuestas:', error);
    res.status(500).send('Error interno al obtener las encuestas');
  }
});

router.post('/', async (req, res) => {
  try {
    const nuevaEncuesta = req.body;
    const ref = await admin.firestore().collection('encuestas').add(nuevaEncuesta);
    res.status(201).json({ id: ref.id, ...nuevaEncuesta });
  } catch (error) {
    console.error('Error al crear la encuesta:', error);
    res.status(500).send('Error interno al crear la encuesta');
  }
});

module.exports = router;