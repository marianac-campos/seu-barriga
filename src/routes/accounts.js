const express = require('express');

const router = express.Router();

module.exports = (app) => {
  router.post('/', (req, res, next) => {
    app.services.account.save(req.body)
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
        res.status(200).json(result[0]);
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
