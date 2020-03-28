const express = require("express");
const graphQLHttp = require("express-graphql-multimode");
const schema = require("./schema/schema.js");
const app = express();
const cors = require('cors');

app.use(cors());


const mongoose = require("mongoose");

const uri = "mongodb+srv://admin:abcd1234@cluster0-9zuvz.mongodb.net/yabie?retryWrites=true&w=majority";

mongoose.connect(uri);

mongoose.connection.once("open", () => {
    console.log('Connected to Mongo DB')
});

app.use("/graphiql", graphQLHttp({
    schema,
    graphiql : true,
}));


app.use("/", graphQLHttp({
    schema
}))

let port = process.env.PORT || 3000;

app.listen(port);