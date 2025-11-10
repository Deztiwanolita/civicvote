const express = require('express');
const admin = require('firebase-admin');
const db = require('../serviceAccountKey.json');
const cors = require('cors');

admin.initializeApp({
  credential: admin.credential.cert(db),
});

const app = express();
app.use(cors());


app.use(express.json());

app.get('/', async (req, res) => {
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

app.post('/addEncuesta', async (req, res) => {
    try {
        const nuevaEncuesta = req.body;
        const ref = await admin.firestore().collection('encuestas').add(nuevaEncuesta);
        res.status(201).json({ id: ref.id, nombre: ref.nombre, preguntas: ref.preguntas, resultados: ref.resultados, votos: ref.votos });
    } catch (error) {
        res.status(500).send('Error al crear la encuesta: ' + error.message);
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT,'0.0.0.0',  () => {
    console.log(`Servidor compilado en:
        - http://localhost:${PORT}
        -http://192.168.1.2:${PORT}`)
});

