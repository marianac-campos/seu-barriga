module.exports = (app) => {
  const create = (req, res, next) => {
    app.services.account.save(req.body)
      .then((result) => res.status(201).json(result[0]))
      .catch((error) => next(error));
  };

  const findAll = (req, res) => {
    app.services.account.find()
      .then((result) => {
        res.status(200).json(result);
      });
  };

  const findById = (req, res) => {
    app.services.account.find({ id: req.params.id })
      .then((result) => {
        res.status(200).json(result[0]);
      });
  };

  const update = (req, res) => {
    app.services.account.update({ accountId: req.params.id, account: req.body })
      .then((result) => {
        res.status(200).json(result[0]);
      });
  };

  const remove = (req, res) => {
    app.services.account.remove({ accountId: req.params.id })
      .then(() => res.status(204).send());
  };

  return {
    create,
    findAll,
    findById,
    update,
    remove,
  };
};
