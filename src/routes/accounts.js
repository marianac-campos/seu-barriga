const express = require('express');
const PermissionError = require('../errors/Permission');

const router = express.Router();

module.exports = (app) => {
  router.param('id', (req, res, next) => {
    app.services.account.find({ id: req.params.id })
      .then((result) => {
        if (result[0].user_id !== req.user.id) throw new PermissionError();
        next();
      }).catch((error) => next(error));
  });

  router.post('/', (req, res, next) => {
    app.services.account.save({ ...req.body, user_id: req.user.id })
      .then((result) => res.status(201).json(result[0]))
      .catch((error) => next(error));
  });

  router.get('/', (req, res) => {
    app.services.account.find({ user_id: req.user.id })
      .then((result) => {
        res.status(200).json(result);
      });
  });

  router.get('/:id', (req, res) => {
    app.services.account.find({ id: req.params.id })
      .then((result) => {
        if (result[0].user_id !== req.user.id) {
          return res.status(403).json({ error: 'Permissão insuficiente!' });
        }
        return res.status(200).json(result[0]);
      });
  });

  router.put('/:id', (req, res) => {
    app.services.account.update({ accountId: req.params.id, account: req.body })
      .then((result) => {
        res.status(200).json(result[0]);
      });
  });

  router.delete('/:id', (req, res) => {
    app.services.account.remove({ accountId: req.params.id })
      .then(() => res.status(204).send());
  });

  return router;
};
