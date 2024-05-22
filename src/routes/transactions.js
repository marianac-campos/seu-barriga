const express = require('express');
const PermissionError = require('../errors/Permission');

const router = express.Router();

module.exports = (app) => {
  router.param('id', (req, res, next) => {
    app.services.transaction.find(req.user.id, { 'transactions.id': req.params.id })
      .then((result) => {
        if (result.length > 0) next();
        else throw new PermissionError();
      }).catch((error) => next(error));
  });

  router.get('/', (req, res, next) => {
    app.services.transaction.find(req.user.id)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => next(error));
  });

  router.get('/:id', (req, res, next) => {
    app.services.transaction.findOne({ id: req.params.id })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => next(error));
  });

  router.post('/', (req, res, next) => {
    return app.services.transaction.save(req.body)
      .then((result) => res.status(201).json(result))
      .catch((error) => next(error));
  });

  router.put('/:id', (req, res) => {
    app.services.transaction.update({ transactionId: req.params.id, transaction: req.body })
      .then((result) => {
        res.status(200).json(result[0]);
      });
  });

  router.delete('/:id', (req, res) => {
    app.services.transaction.remove({ transactionId: req.params.id })
      .then(() => res.status(204).send());
  });

  return router;
};
