const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const find = (filter = {}) => {
    return app.db('transfers')
      .where(filter)
      .select();
  };

  const findOne = (filter = {}) => {
    return app.db('transfers')
      .where(filter)
      .first();
  };

  const validate = async (transfer) => {
    if (!transfer.description) throw new ValidationError('Description is a mandatory attribute!');
    if (!transfer.amount) throw new ValidationError('Amount is a mandatory attribute!');
    if (!transfer.date) throw new ValidationError('Date is a mandatory attribute!');
    if (!transfer.acc_ori_id) throw new ValidationError('Origin account is a mandatory attribute!');
    if (!transfer.acc_dest_id) throw new ValidationError('Destiny account is a mandatory attribute!');
    if (transfer.acc_ori_id === transfer.acc_dest_id) throw new ValidationError('The origin and destination account must not be the same!');

    const accounts = await app.db('accounts')
      .whereIn('id', [transfer.acc_ori_id, transfer.acc_dest_id])
      .select();

    accounts.forEach((acc) => {
      if (acc.user_id !== parseInt(transfer.user_id, 10)) {
        throw new ValidationError('Account belongs to another user');
      }
    });
  };

  const save = async (transfer) => {
    const result = await app.db('transfers').insert(transfer, '*');
    const transferId = result[0].id;

    const transactions = [
      { description: `Transfer To Account #${transfer.acc_dest_id}`, date: transfer.date, amount: transfer.amount * -1, type: 'O', acc_id: transfer.acc_ori_id, transfer_id: transferId },
      { description: `Transfer From Account #${transfer.acc_ori_id}`, date: transfer.date, amount: transfer.amount, type: 'I', acc_id: transfer.acc_dest_id, transfer_id: transferId },
    ];

    await app.db('transactions').insert(transactions);

    return result;
  };

  const update = async ({ transferId, transfer }) => {
    const result = await app.db('transfers')
      .where({ id: transferId })
      .update(transfer, '*');

    const transactions = [
      {
        description: `Transfer To Account #${transfer.acc_dest_id}`,
        date: transfer.date,
        amount: transfer.amount * -1,
        type: 'O',
        acc_id: transfer.acc_ori_id,
        transfer_id: transferId,
      },
      {
        description: `Transfer From Account #${transfer.acc_ori_id}`,
        date: transfer.date,
        amount: transfer.amount,
        type: 'I',
        acc_id: transfer.acc_dest_id,
        transfer_id: transferId,
      },
    ];

    await app.db('transactions').where({ transfer_id: transferId }).del();
    await app.db('transactions').insert(transactions);

    return result;
  };

  const remove = ({ transferId }) => {
    return app.db('transactions').where({ transfer_id: transferId }).del()
      .then(() => app.db('transfers').where({ id: transferId }).del());
  };

  return { find, save, findOne, update, validate, remove };
};
