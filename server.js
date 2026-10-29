const express = require('express');
const nunjucks = require('nunjucks');
const path = require('node:path');
const { createDatabase } = require('./bd');

function createApp(db) {
  const app = express();
  nunjucks.configure(path.join(__dirname, 'views'), { express: app, noCache: true, autoescape: true });
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.urlencoded({ extended: false }));

  app.get('/', (req, res) => {
    res.render('index.html', { projetos: db.prepare('SELECT * FROM projetos ORDER BY id DESC').all() });
  });

  app.get('/projetos', (req, res) => {
    res.render('projects.html', { projetos: db.prepare('SELECT * FROM projetos ORDER BY id DESC').all() });
  });

  app.post('/', (req, res) => {
    const { image = '', title = '', category = '', description = '', link = '' } = req.body;
    if (!title.trim()) return res.status(400).send('Informe o título do projeto.');
    db.prepare('INSERT INTO projetos (imagem, titulo, categoria, descricao, url) VALUES (?, ?, ?, ?, ?)')
      .run(image, title.trim(), category, description, link);
    res.redirect(303, '/projetos');
  });

  app.post('/excluir/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!/^\d+$/.test(req.params.id) || !Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).send('Identificador de projeto inválido.');
    }
    const result = db.prepare('DELETE FROM projetos WHERE id = ?').run(id);
    if (result.changes === 0) return res.status(404).send('Projeto não encontrado.');
    return res.redirect(303, '/projetos');
  });

  app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).send('Não foi possível concluir a operação. Tente novamente.');
  });
  return app;
}

if (require.main === module) {
  const app = createApp(createDatabase());
  app.listen(process.env.PORT || 3000, () => console.log('FeCEAP: http://localhost:' + (process.env.PORT || 3000)));
}
module.exports = { createApp };
