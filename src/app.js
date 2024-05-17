const app = require('express')();
const consign = require('consign');
const knex = require('knex');
// const knexLogger = require('knex-logger');
const knexFile = require('../knexfile');

app.db = knex(knexFile.test);

// app.use(knexLogger(app.db));

consign({ cwd: 'src', verbose: false })
  .include('./config/passport.js')
  .then('./config/middlewares.js')
  .then('./services')
  .then('./routes')
  .then('./config/router.js')
  .into(app);

app.get('/', (req, res) => {
  res.status(200).send();
});

app.use((error, req, res, next) => {
  const { name, message, stack } = error;

  if (name === 'ValidationError') res.status(400).json({ error: message });
  if (name === 'Permission') res.status(403).json({ error: message });
  res.status(400).json(name, message, stack);

  next(error);
});

module.exports = app;
