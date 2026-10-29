# FeCEAP — Kawan

Repositório independente para a atividade de cadastro, listagem e exclusão de projetos. A interface foi adaptada do material de referência https://github.com/DaviDaSilvaSantos/SiteFeCEAP; o repositório original não é alterado por este projeto.

## Executar

Requisito: Node.js 22.13 ou superior. Dentro desta pasta:

```sh
npm install
npm start
```

Abra http://localhost:3000. O banco SQLite `siteAula.bd` é criado automaticamente, vazio, no primeiro uso. Esta versão usa o módulo `node:sqlite` do Node.js, sem compilar dependências nativas. No Node 22, pode aparecer um aviso de recurso experimental.

## Excluir

Cadastre um projeto e clique em **Excluir projeto**, no próprio card da página inicial ou de /projetos. Confirme a exclusão. O servidor remove apenas o ID indicado no banco e então redireciona para a listagem. Cancelar mantém o projeto. IDs inválidos retornam 400, inexistentes retornam 404 e falhas de banco retornam 500.

## Testar

```sh
npm test
```

Os testes usam banco temporário: conferem os botões, o cadastro, a remoção persistente, a preservação de outro projeto, IDs inválidos e falha de banco. Nenhum projeto real é excluído nos testes.

## Repositório

Este diretório é um repositório Git independente, sem vínculo remoto com o material de referência. Dados locais e dependências instaladas ficam fora do versionamento.
