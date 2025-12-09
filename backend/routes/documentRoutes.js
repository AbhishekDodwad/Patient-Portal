const {
  uploadDocument,
  listDocuments,
  downloadDocument,
  deleteDocument
} = require('../controllers/documentController');

async function documentRoutes(fastify, options) {
  fastify.post('/upload', uploadDocument);

  fastify.get('/', listDocuments);

  fastify.get('/:id', downloadDocument);

  fastify.delete('/:id', deleteDocument);
}

module.exports = documentRoutes;
