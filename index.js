const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))

// bodyParser middleware for form submission
app.use(express.urlencoded({ extended: true }));

// classes
class User {
  constructor(username, _id){
    this.username = username;
    this._id = _id;
  }
}

class Exercise {
  constructor(user_id, desc, dur, date){
    this.user_id = user_id;
    this.desc = desc;
    this.dur = dur;
    this.date = date;
  }
}

// variables
let users = [];
let exercises = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// the API code
app.post('/api/users', (req, res) => {
  let username = req.body.username;

  let newUser = new User(username, users.length);
  users.push(newUser);

  res.json({
    username: newUser.username,
    _id: newUser._id
  })
})

app.get('/api/users', (req, res) => {
  res.json(
    users.map(user => ({
      username: user.username,
      _id: String(user._id)
    }))
  );
});


app.post('/api/users/:_id/exercises', (req, res) => {
  let userId = req.params._id;
  let desc = req.body.description;
  let duration = parseInt(req.body.duration);
  let date = new Date();
  if (req.body.date){
    date = new Date(req.body.date);
  }

  let newExercise = new Exercise(userId, desc, duration, date);
  exercises.push(newExercise);

  // get referenced user
  let refUser = users.find(user => user._id == newExercise.user_id);
  
  res.json({
    username: refUser.username,
    description: newExercise.desc,
    duration: newExercise.dur,
    date: date.toDateString(),
    _id: refUser._id
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  let id = req.params._id;
  const { from, to, limit } = req.query;

  let user = users.find(u => u._id == id);
  let userExercises = exercises.filter(e => e.user_id == user._id);

  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(e => new Date(e.date) >= fromDate);
  }
  
  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(e => new Date(e.date) <= toDate);
  }

  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: id,
    log: userExercises.map(e => ({
      description: e.desc,
      duration: e.dur,
      date: e.date.toDateString()
    }))
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
