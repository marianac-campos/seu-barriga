module.exports = (app) => {
  app.route('/users')
    .post(app.routes.users.create)
    .get(app.routes.users.findAll);

  app.route('/accounts')
    .post(app.routes.accounts.create)
    .get(app.routes.accounts.findAll);

  app.route('/accounts/:id')
    .put(app.routes.accounts.update)
    .get(app.routes.accounts.findById)
    .delete(app.routes.accounts.remove);
};
