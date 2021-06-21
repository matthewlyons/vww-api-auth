require('dotenv').config();

const { connectDB, checkAdmin } = require('./helpers');
const app = require('./index');

connectDB()
  .then((message) => {
    console.log(message);
    checkAdmin();
  })
  .catch((err) => {
    console.log(err);
  });

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`App Listening on Port: ${port}`);
});
