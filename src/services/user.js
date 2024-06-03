const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/ValidationError');

const getPasswordHash = (password) => {
  const SALT = bcrypt.genSaltSync(10);

  return bcrypt.hashSync(password, SALT);
};

module.exports = (app) => {
  const findAll = () => {
    return app.db('users').select();
  };

  const findOne = (filter = {}) => {
    return app.db('users').where(filter).first();
  };

  const save = async (user) => {
    if (!user.name) throw new ValidationError('Name is a mandatory attribute!');
    if (!user.email) throw new ValidationError('Email is a mandatory attribute!');
    if (!user.password) throw new ValidationError('Password is a mandatory attribute!');

    const userDb = await findOne({ email: user.email });

    const userToSave = { ...user };
    userToSave.password = getPasswordHash(user.password);

    if (userDb) throw new ValidationError('User already created!');

    return app.db('users').insert(userToSave, ['id', 'name', 'email']);
  };

  return { findAll, findOne, save };
};
