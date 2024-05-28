const express = require('express');
const PermissionError = require('../errors/Permission');

const router = express.Router();

module.exports = (app) => {
  const validate = (req, res, next) => {
    app.services.transfer.validate({ ...req.body, user_id: req.user.id })
      .then(() => next())
      .catch((error) => next(error));
  };

  router.param('id', (req, res, next) => {
    app.services.transfer.findOne({ id: req.params.id })
      .then((result) => {
        if (result.length > 0) next();
        else throw new PermissionError();
      }).catch((error) => next(error));
  });

  router.get('/', (req, res, next) => {
    app.services.transfer.find({ user_id: req.user.id })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => next(error));
  });

  router.post('/', validate, (req, res, next) => {
    const transfer = { ...req.body, user_id: req.user.id };
    return app.services.transfer.save(transfer)
      .then((result) => res.status(201).json(result))
      .catch((error) => next(error));
  });

  router.get('/:id', (req, res, next) => {
    app.services.transfer.findOne({ id: req.params.id })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => next(error));
  });

  router.put('/:id', validate, (req, res, next) => {
    app.services.transfer.update({
      transferId: req.params.id,
      transfer: { ...req.body, user_id: req.user.id },
    })
      .then((result) => {
        res.status(200).json(result[0]);
      })
      .catch((error) => next(error));
  });

  router.delete('/:id', (req, res) => {
    app.services.transfer.remove({ transferId: req.params.id })
      .then(() => res.status(204).send());
  });

  return router;
};
