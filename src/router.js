const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.get('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signupPage);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/fill', mid.requiresLogin, controllers.Fill.fillPage);
  app.get('/outline', mid.requiresLogin, controllers.Fill.outlinePage);
  app.post('/save', mid.requiresLogin, controllers.Fill.save);
  app.get('/templates', mid.requiresLogin, controllers.Fill.templatesPage);
  app.get('/fill/:id', mid.requiresLogin, controllers.Fill.select);
  app.post('/remove/:id', mid.requiresLogin, controllers.Fill.remove);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
