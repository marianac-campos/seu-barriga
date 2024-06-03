const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const find = (filter = {}) => {
    return app.db('accounts').where(filter).select();
  };

  const save = async (account) => {
    if (!account.name) throw new ValidationError('Name is a mandatory attribute!');

    const accountDb = await find({ name: account.name, user_id: account.user_id });

    if (accountDb.length > 0) throw new ValidationError('An account with that name already exists');

    return app.db('accounts').insert(account, '*');
  };

  const update = ({ accountId, account }) => {
    return app.db('accounts').where({ id: accountId }).update(account, '*');
  };

  const remove = async ({ accountId }) => {
    const transactions = await app.services.transaction.findOne({ acc_id: accountId });
    if (transactions) throw new ValidationError('There are transactions made by this user');

    return app.db('accounts').where({ id: accountId }).del();
  };

  return {
    save,
    find,
    update,
    remove,
  };
};
