const { responderRecurso } = require('./resource-handler');

const VALID_KEYS = ['membros', 'repertorio', 'escalas'];

module.exports = async (req, res) => {
  const resource = req.query.resource;

  if (!VALID_KEYS.includes(resource)) {
    return res.status(404).json({ error: 'Recurso não encontrado' });
  }

  return responderRecurso(req, res, resource);
};
