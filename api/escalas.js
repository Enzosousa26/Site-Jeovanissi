const { responderRecurso } = require('./resource-handler');

module.exports = async (req, res) => responderRecurso(req, res, 'escalas');
