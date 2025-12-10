const express = require('express');
console.log("✅ Rutas de /api/encuestas cargadas");
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

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No se enviaron datos para actualizar.' });
    }

    await admin.firestore().collection('encuestas').doc(id).update(data);
    res.status(200).json({ id, mensaje: 'Encuesta actualizada correctamente.' });
  } catch (error) {
    console.error('Error al actualizar la encuesta:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await admin.firestore().collection('encuestas').doc(id).delete();
    res.status(200).json({ mensaje: 'Encuesta eliminada correctamente.' });
  } catch (error) {
    console.error('Error al eliminar encuesta:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;