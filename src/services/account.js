const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const save = async (account) => {
    if (!account.name) throw new ValidationError('Name is a mandatory attribute!');

    return app.db('accounts').insert(account, '*');
  };

  const find = (filter = {}) => {
    return app.db('accounts').where(filter).select();
  };

  const update = ({ accountId, account }) => {
    return app.db('accounts').where({ id: accountId }).update(account, '*');
  };

  const remove = ({ accountId }) => {
    return app.db('accounts').where({ id: accountId }).del();
  };

  return {
    save,
    find,
    update,
    remove,
  };
};
