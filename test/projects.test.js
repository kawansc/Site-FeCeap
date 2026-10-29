const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, unlinkSync, rmdirSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { createApp } = require('../server');
const { createDatabase } = require('../bd');

test('cadastro e exclusão persistente de projetos', async (t) => {
  const directory = mkdtempSync(path.join(tmpdir(), 'feceap-test-'));
  const filename = path.join(directory, 'test.bd');
  let db = createDatabase(filename);
  const server = createApp(db).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const post = (url, body) => fetch(base + url, { method: 'POST', redirect: 'manual', body: new URLSearchParams(body) });
  try {
    await t.test('cadastra e mostra botão em cada card das duas páginas', async () => {
      for (const title of ['Projeto A', 'Projeto B']) {
        const response = await post('/', { title, category: 'Ciências', description: 'Estudo', link: 'https://example.com' });
        assert.equal(response.status, 303);
      }
      for (const page of ['/', '/projetos']) {
        const html = await (await fetch(base + page)).text();
        assert.equal((html.match(/class="button delete-button"/g) || []).length, 2);
        assert.ok(html.includes('action="/excluir/1"'));
        assert.ok(html.includes('action="/excluir/2"'));
        assert.ok(html.includes('return confirm('));
      }
    });
    await t.test('exclui só o projeto escolhido e persiste no SQLite', async () => {
      const response = await post('/excluir/1');
      assert.equal(response.status, 303);
      assert.equal(response.headers.get('location'), '/projetos');
      assert.deepEqual(db.prepare('SELECT titulo FROM projetos').all().map(row => row.titulo), ['Projeto B']);
      const otherConnection = createDatabase(filename);
      assert.equal(otherConnection.prepare('SELECT COUNT(*) AS total FROM projetos').get().total, 1);
      otherConnection.close();
      const html = await (await fetch(base + '/projetos')).text();
      assert.ok(!html.includes('Projeto A'));
      assert.ok(html.includes('Projeto B'));
    });
    await t.test('rejeita IDs inválidos e inexistentes sem excluir outros projetos', async () => {
      for (const id of ['0', '-1', 'abc', '1%20OR%201%3D1', '9007199254740992']) {
        assert.equal((await post('/excluir/' + id)).status, 400);
      }
      assert.equal((await post('/excluir/999')).status, 404);
      assert.equal((await fetch(base + '/excluir/2')).status, 404);
      assert.equal(db.prepare('SELECT COUNT(*) AS total FROM projetos').get().total, 1);
    });
    await t.test('permite excluir o último card e mostra lista vazia', async () => {
      assert.equal((await post('/excluir/2')).status, 303);
      const html = await (await fetch(base + '/projetos')).text();
      assert.ok(html.includes('Nenhum projeto cadastrado'));
      assert.equal((await post('/excluir/2')).status, 404);
    });
    await t.test('falha do banco retorna erro sem redirecionar', async () => {
      db.close();
      db = null;
      const response = await post('/excluir/3');
      assert.equal(response.status, 500);
      assert.equal(response.headers.get('location'), null);
    });
  } finally {
    await new Promise(resolve => server.close(resolve));
    if (db) db.close();
    unlinkSync(filename);
    rmdirSync(directory);
  }
});
