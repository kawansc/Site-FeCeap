const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

function createDatabase(filename = path.join(__dirname, 'siteAula.bd')) {
  const db = new DatabaseSync(filename);
  db.exec('CREATE TABLE IF NOT EXISTS projetos (id INTEGER PRIMARY KEY AUTOINCREMENT, imagem TEXT, titulo TEXT, categoria TEXT, descricao TEXT, url TEXT)');
  return db;
}

module.exports = { createDatabase };
