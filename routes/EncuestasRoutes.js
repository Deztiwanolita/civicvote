const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.get('/', async (req, res) => {
    try {
        const datos = await admin.firestore().collection('encuestas').get();
        const encuestas = [];
        datos.forEach((doc) => {
            encuestas.push({ id: doc.id, ...doc.data()})
        });
        res.status(200).json(encuestas);
        console.log(encuestas);
    }catch (error) {
       res.status(500).send('Error al obtener las encuestas: ' + error.message);
    }
});

router.post('/addEncuesta', async (req, res) => {
    try {
        const nuevaEncuesta = req.body;
        const ref = await admin.firestore().collection('encuestas').add(nuevaEncuesta);
        res.status(201).json({ id: ref.id, nombre: ref.nombre, preguntas: ref.preguntas, resultados: ref.resultados, votos: ref.votos });
    } catch (error) {
        res.status(500).send('Error al crear la encuesta: ' + error.message);
    }
});

module.exports = router;
