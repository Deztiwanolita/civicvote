const { admin } = require('./firebase');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token requerido en el encabezado Authorization' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(' Error al verificar token Firebase:', err.message);
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = authMiddleware;