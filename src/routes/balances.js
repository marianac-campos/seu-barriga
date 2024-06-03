const express = require('express');

const router = express.Router();

module.exports = (app) => {
  router.get('/', (req, res, next) => {
    app.services.balance.getBalance({ userId: req.user.id })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => next(error));
  });

  return router;
};
