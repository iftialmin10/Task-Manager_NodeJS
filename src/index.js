const app = require('./app');

const port = process.env.PORT; //Define port. 1st one is for deployment site port and 2nd is for localhost

app.listen(port, () => {
  console.log('Server is up on port ' + port);
});
