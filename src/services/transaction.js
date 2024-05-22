const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const find = (userId, filter = {}) => {
    return app.db('transactions')
      .join('accounts', 'accounts.id', 'acc_id')
      .where(filter)
      .andWhere('accounts.user_id', '=', userId)
      .select();
  };

  const findOne = (filter = {}) => {
    return app.db('transactions')
      .where(filter)
      .first();
  };

  const save = async (transaction) => {
    const newTransaction = { ...transaction };

    if (!newTransaction.description) throw new ValidationError('Description is a mandatory attribute!');
    if (!newTransaction.date) throw new ValidationError('Date is a mandatory attribute!');
    if (!newTransaction.amount) throw new ValidationError('Amount is a mandatory attribute!');
    if (!newTransaction.acc_id) throw new ValidationError('AccountID is a mandatory attribute!');
    if (!newTransaction.type) throw new ValidationError('Type is a mandatory attribute!');
    if (newTransaction.type !== 'I' || newTransaction.type !== 'O') throw new ValidationError('Invalid Type!');

    if ((newTransaction.type === 'I' && newTransaction.amount < 0)
      || (newTransaction.type === 'O' && newTransaction.amount > 0)) {
      newTransaction.amount *= -1;
    }

    return app.db('transactions').insert(newTransaction, '*');
  };

  const update = ({ transactionId, transaction }) => {
    return app.db('transactions')
      .where({ id: transactionId })
      .update(transaction, '*');
  };

  const remove = ({ transactionId }) => {
    return app.db('transactions').where({ id: transactionId }).del();
  };

  return { find, findOne, save, update, remove };
};
