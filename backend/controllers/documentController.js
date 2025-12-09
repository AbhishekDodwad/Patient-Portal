const pool = require('../config/database');
const path = require('path');
const fs = require('fs');
const { pipeline } = require('stream/promises');

const uploadDocument = async (request, reply) => {
  try {
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    if (data.mimetype !== 'application/pdf') {
      return reply.status(400).send({ error: 'Only PDF files are allowed' });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(data.filename);
    const name = path.basename(data.filename, ext);
    const filename = `${uniqueSuffix}-${name}${ext}`;

    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);

    const writeStream = fs.createWriteStream(filepath);
    await pipeline(data.file, writeStream);

    const stats = fs.statSync(filepath);
    const filesize = stats.size;

    const result = await pool.query(
      'INSERT INTO documents (filename, filepath, filesize) VALUES ($1, $2, $3) RETURNING *',
      [filename, filepath, filesize]
    );

    return reply.status(201).send({
      message: 'File uploaded successfully',
      document: {
        id: result.rows[0].id,
        filename: result.rows[0].filename,
        filesize: result.rows[0].filesize,
        created_at: result.rows[0].created_at
      }
    });
  } catch (error) {
    request.log.error('Upload error:', error);
    return reply.status(500).send({ error: 'Failed to upload file' });
  }
};

const listDocuments = async (request, reply) => {
  try {
    const result = await pool.query(
      'SELECT id, filename, filesize, created_at FROM documents ORDER BY created_at DESC'
    );

    return reply.send({
      documents: result.rows
    });
  } catch (error) {
    request.log.error('List error:', error);
    return reply.status(500).send({ error: 'Failed to fetch documents' });
  }
};

const downloadDocument = async (request, reply) => {
  try {
    const { id } = request.params;

    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return reply.status(404).send({ error: 'Document not found' });
    }

    const document = result.rows[0];
    const filepath = document.filepath;

    if (!fs.existsSync(filepath)) {
      return reply.status(404).send({ error: 'File not found on server' });
    }

    reply.header('Content-Disposition', `attachment; filename="${document.filename}"`);
    reply.type('application/pdf');

    const fileStream = fs.createReadStream(filepath);
    return reply.send(fileStream);
  } catch (error) {
    request.log.error('Download error:', error);
    return reply.status(500).send({ error: 'Failed to download file' });
  }
};

const deleteDocument = async (request, reply) => {
  try {
    const { id } = request.params;

    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return reply.status(404).send({ error: 'Document not found' });
    }

    const document = result.rows[0];
    const filepath = document.filepath;

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    await pool.query('DELETE FROM documents WHERE id = $1', [id]);

    return reply.send({
      message: 'Document deleted successfully',
      id: parseInt(id)
    });
  } catch (error) {
    request.log.error('Delete error:', error);
    return reply.status(500).send({ error: 'Failed to delete document' });
  }
};

module.exports = {
  uploadDocument,
  listDocuments,
  downloadDocument,
  deleteDocument
};
