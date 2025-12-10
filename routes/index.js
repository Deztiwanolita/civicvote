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

const encuestasRoutes = require('./EncuestasRoutes');
const preguntasRoutes = require('./PreguntasRoutes');
const votosRoutes = require('./VotosRoutes');
const resultadosRoutes = require('./ResultadosRoutes');


app.use('/api/encuestas', encuestasRoutes);
app.use('/api/preguntas', preguntasRoutes);
app.use('/api/votos', votosRoutes);
app.use('/api/resultados', resultadosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en:
    - http://localhost:${PORT}
    - http://192.168.1.2:${PORT}`);
});