const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jwt-simple');
const ValidationError = require('../errors/ValidationError');

const SECRET = 'secredo!';
const router = express.Router();

module.exports = (app) => {
  router.post('/signin', (req, res, next) => {
    app.services.user.findOne({ email: req.body.email })
      .then((user) => {
        if (user && bcrypt.compareSync(req.body.password, user.password)) {
          const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
          };

          const token = jwt.encode(payload, SECRET);

          return res.status(200).json({ token });
        }

        throw new ValidationError('Invalid login and/or password');
      }).catch((error) => next(error));
  });

  router.post('/signup', (req, res, next) => {
    return app.services.user.save(req.body)
      .then((result) => res.status(201).json(result[0]))
      .catch((error) => next(error));
  });

  return router;
};
