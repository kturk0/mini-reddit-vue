const express = require("express");
const cors = require('cors');

const app = express();
const server = require("http").createServer(app);

app.use(cors({
  credentials: true,
  origin: 'http://192.168.1.13:8080'
}));

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

const client = require('./dbCon.js');


// Passport.js
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// Mechanizm sesji (wykorzystamy bazę Redis)
const session = require("express-session");
const redis = require("redis");
const RedisStore = require("connect-redis")(session);
const redisClient = redis.createClient();
redisClient.on("error", err => {
    console.log(`Błąd (redisClient): ${err}`);
});
const sessionStore = new RedisStore({
    client: redisClient
});
const sessionMiddleware = session({
  secret: "sekretnysekret",
  store: sessionStore,
  resave: false,
  saveUninitialized: false
});

// Konfigurujemy aplikację Express.js
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy((username, password, done) => {
    return client.query("SELECT * " +
    "FROM reddit_user " +
    "WHERE email=$1 AND password=$2", [username, password])
      .then((result)=> {
        return done(null, result.rows[0]);
     })
     .catch((err) => {
       console.log("Błędne dane logowania" + err);
       return done(null, false, {message:'Wrong user login or password'});
     });
  })
);

passport.serializeUser((user, cb) => {
  console.log(user);
  console.log(`Passport: wywołujemy „serializeUser” dla user.id == ${user.id}`);
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  console.log(`Passport: wywołujemy „deserializeUser” dla id == ${id}`);
  client.query("SELECT * FROM reddit_user WHERE id = $1", [id])
  .then((user)=>{
     cb(null, user.rows[0]);
  })
  .catch((err)=>{
    cb(new Error(`User with the id ${id} does not exist`));
  })
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

app.post("/logout", (req, res) => {
  console.log(`Passport: kończymy sesję o sessio.id == ${req.session.id}`);
  console.log("Passport: wylogowujemy się");
  req.logout();
  res.redirect("/");
});


app.get("/", async (req, res) => {
    const isAuth = !!req.user;
    res.send(isAuth);
});

app.get("/user", async (req, res) => {
  res.send(req.user);
});

//Multer
var multer  = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
var upload = multer({ storage: storage })
var fs = require('fs');
app.use(express.static('images'));

app.post('/image', upload.single('image'), function (req, res, next) {
  res.send("file received")
})

app.delete("/image/:name", async (req, res) => {
  const name = req.params.name;
  var filePath = 'images/' + name; 
  try {
   fs.unlinkSync(filePath);
  }
  catch(err) {
    console.log("Plik z usuniętego posta nie znajduje się na serwerze")
  }
});


const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
// Konfigurujemy Socket.io (z wykorzystaniem połączenia z Express.js)
const io = require('socket.io')(server);
io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
  if (socket.request.user) {
    console.log("Socket.io: użytkownik poprawnie zalogowany");
    next();
  } else {
    console.log("Socket.io: użytkownik niezalogowany");
    next();
  }
});


io.on('connect', (socket) => {
  console.log(`Socket.io: nowe połączenie, socket.id == ${socket.id}`);
  let i = 0;
  socket.on('whoami', (cb) => {
    i = i + 1;
    cb(socket.request.user ? socket.request.user.username + `${i}` : '');
  });
  socket.on("deletedComment", (data) => {
    io.emit("commentDeleted", data);
  });
  socket.on("addedComment", (data) => {
    io.emit("commentAdded", data);
  });
  socket.on("changedScore", (data, idVote) => {
    if(idVote === -1)
      client.query('INSERT INTO post_vote (vote, user_id, post_id) VALUES ($1, $2, $3)', [data.vote, data.user_id, data.post_id], (error,results) => {
        if(error) {
          throw error;
        }
      })
    else if(data.vote === 0)
      client.query('DELETE FROM post_vote WHERE id = $1', [idVote], (error,results) => {
        if(error) {
          throw error;
        }
      })
    else
      client.query('UPDATE post_vote SET vote = $1, user_id = $2, post_id = $3 WHERE id = $4', [data.vote, data.user_id, data.post_id, idVote], (error,results) => {
        if(error) {
          throw error;
        } 
      })
    io.emit("scoreChanged");
  });
  const session = socket.request.session;
  console.log(`Socket.io: zapisujemy socket.id == ${socket.id} w sesji o session.id == ${session.id}`);
  session.socketId = socket.id;
  session.save();
});

var comment = require('./routes/comment');
var post_vote = require('./routes/post_vote');
var post = require('./routes/post');
var reddit_user = require('./routes/reddit_user');
var subreddit_moderator = require('./routes/subreddit_moderator');
var subreddit_user = require('./routes/subreddit_user');
var subreddit = require('./routes/subreddit');

app.use('/comment',comment);
app.use('/post_vote',post_vote);
app.use('/post',post);
app.use('/reddit_user',reddit_user);
app.use('/subreddit_moderator',subreddit_moderator);
app.use('/subreddit_user',subreddit_user)
app.use('/subreddit',subreddit);



server.listen(
  5000, () => { console.log("listening to port 5000")}
)