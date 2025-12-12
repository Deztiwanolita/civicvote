const express = require('express');
const router = express.Router();
const { db } = require('./firebase'); // Asegúrate que la ruta a firebase sea correcta

// 1. Obtener TODAS las encuestas (Esta ya te funciona)
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('encuestas').get();
        const encuestas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(encuestas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Obtener UNA encuesta por ID (ESTA ES LA QUE TE FALTA)
router.get('/:id', async (req, res) => {
    try {
        const doc = await db.collection('encuestas').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Encuesta no encontrada' });
        }
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Crear encuesta (Ya la tienes)
router.post('/', async (req, res) => {
    try {
        const nuevaEncuesta = req.body;
        await db.collection('encuestas').add(nuevaEncuesta);
        res.status(201).json({ msg: 'Encuesta creada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Actualizar encuesta (Ya la tienes)
router.put('/:id', async (req, res) => {
    try {
        await db.collection('encuestas').doc(req.params.id).update(req.body);
        res.json({ msg: 'Encuesta actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Eliminar encuesta (Ya la tienes)
router.delete('/:id', async (req, res) => {
    try {
        await db.collection('encuestas').doc(req.params.id).delete();
        res.json({ msg: 'Encuesta eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;