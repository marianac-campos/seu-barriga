module.exports = (app) => {
  const create = async (req, res) => {
    const result = await app.services.account.save(req.body);

    if (result.error) return res.status(400).json(result);

    return res.status(201).json(result[0]);
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

  return { create, findAll, findById };
};
