const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true, // To parse the URL properly
  useCreateIndex: true, // To find data easily
  /*
  This is going to make sure that when Mongoose works with MongoDB, our
  indexes are created allowing us to quickly access the data we need to access
  */
  useFindAndModify: false,
});
