// CRUD operation
const { MongoClient, ObjectID } = require("mongodb");

const connectionURL = "mongodb://127.0.0.1:27017";
const databaseName = "task-manager";

MongoClient.connect(
  connectionURL,
  { useNewUrlParser: true },
  (error, client) => {
    if (error) {
      return console.log("unable to connect");
    }

    const db = client.db(databaseName);

    // DeleteOne
    db.collection("tasks")
      .deleteOne({
        description: "Wash the Car",
      })
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  }
);
