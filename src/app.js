const app = require('express')();
const consign = require('consign');
const knex = require('knex');
const winston = require('winston');
const uuid = require('uuidv4');
// const knexLogger = require('knex-logger');
const knexFile = require('../knexfile');

app.db = knex(knexFile[process.env.NAME || 'test']);

app.log = winston.createLogger({
  leven: 'debug',
  transports: [
    new winston.transports.Console({ format: winston.format.json({ space: 1 }) }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'warn',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json({ space: 1 })),
    }),
  ],
});
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
  else if (name === 'Permission') res.status(403).json({ error: message });
  else {
    const id = uuid();

    app.log.error({ id, name, message, stack });
    res.status(400).json({ id, error: 'Falha interna' });
  }

  next(error);
});

module.exports = app;
