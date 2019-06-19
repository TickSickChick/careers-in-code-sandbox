const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');

const moment = require('moment');
const fs = require('fs');

const Sequelize = require('sequelize');
const db = new Sequelize('postgres', 'postgres', 'cic', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

const User = require('./models/user')(db, Sequelize.DataTypes);
const Message = require('./models/message')(db, Sequelize.DataTypes);

User.prototype.sendMessage = function(text) {
  return Message.create({ user_id: this.id, text: text });
}

// NOTE: we are using migrations now! No need for this!
// // If "force" is "true", this will tear down & 
// // recreate all tables (including the data!)
// db.sync({ force: false });

// Create a new Express app
const app = express(); 
app.use(cors()); // add CORS middleware so we can connect to a remote server from our client webpage
app.use(bodyparser.json()); // add bodyparser middleware so we can get access to req.body


// GET a list of users
app.get('/users', async function(req, res) {
  const users = await User.findAll();
  res.send(users);
});

// POST a new user
app.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.send({ status: 'ok', user: user });
  } catch (error) {
    res.send({ status: 'error', error: error });
  }
});

// GET a list of messages
app.get('/messages', async (req, res) => {
  const messages = await Message.findAll();
  res.send(messages);
});

// POST a new message
app.post('/messages', async (req, res) => {
  try {
    const message = await Message.create({
      userId: req.body.userId,
      text: req.body.text
    });
    // const user = await User.findByPk(req.body.user_id);
    // const message = await user.sendMessage(req.body.text);
    res.send({ status: 'ok', message: message });
  } catch (error) {
    res.send({ status: 'error', error: error });
  }
});


// tell our express app to listen on port 8081 on requests from any IP address (0.0.0.0)
app.listen(8081, "0.0.0.0", () => {
  // use a callback to make sure our server started up correctly, this won't print if we run into
  // issues with the port already being used
  console.log("Server is running");
});
