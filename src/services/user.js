module.exports = (app) => {
  const findAll = (filter = {}) => {
    return app.db('users').where(filter).select();
  };

  const save = async (user) => {
    const { name, email, password } = user;
    if (!name) return { error: 'Name is a mandatory attribute!' };
    if (!email) return { error: 'Email is a mandatory attribute!' };
    if (!password) return { error: 'Password is a mandatory attribute!' };

    const userDb = await findAll({ email });

    if (userDb && userDb.length > 0) return { error: 'User already created!' };

    return app.db('users').insert(user, '*');
  };

  return { findAll, save };
};
