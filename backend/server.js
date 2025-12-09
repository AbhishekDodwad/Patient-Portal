const fastify = require('fastify')({ logger: true });
require('dotenv').config();

const documentRoutes = require('./routes/documentRoutes');

const PORT = process.env.PORT || 3001;


fastify.register(require('@fastify/cors'), {
  origin: true
});

// Register multipart plugin for file uploads
fastify.register(require('@fastify/multipart'), {
  limits: {
    fileSize: 10 * 1024 * 1024 
  }
});


fastify.register(documentRoutes, { prefix: '/api/documents' });


fastify.get('/health', async (request, reply) => {
  return { status: 'OK', message: 'Server is running' };
});


fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);

  if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
    return reply.status(400).send({ error: 'File too large. Maximum size is 10MB' });
  }

  if (error.message === 'Only PDF files are allowed') {
    return reply.status(400).send({ error: error.message });
  }

  if (error.validation) {
    return reply.status(400).send({ error: error.message });
  }

  return reply.status(500).send({ error: 'Internal server error' });
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
