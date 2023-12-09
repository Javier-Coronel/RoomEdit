const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const router = express.Router();
const multer = require("multer");
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {body, validationResult} = require('express-validator');
const app = express();
require('dotenv').config();

let bodyparser = require('body-parser');
let userModel = require('./models/User');
let commentModel = require('./models/Comment');
let imageModel = require('./models/Image');
let roomModel = require('./models/Room');
let valorationModel = require('./models/Valoration');
let usersRouter = require('./routes/users');
let roomsRouter = require('./routes/rooms');
let valorationsRouter = require('./routes/valorations');
let commentsRouter = require('./routes/comments');
let imagesRouter = require("./routes/images")

const mongoose = require('mongoose');
const { title } = require('process');
mongoose.set('strictQuery', false); //requerido para quitar el warning
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connection successful')
    checkUsers()
  })
  .catch((err) => console.error(err));

mongoose.connection;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let checkUsers = ()=> {
  userModel.count().then((number)=>{
    if(number == 0)userModel.create({
      name: "admin",
      code: "admin",
      password: "admin",
      type: "Admin"
    }).then(user => {
      roomModel.create({
        userId: user._id,
        name:"",
        images:[],
        roomAsImage:""
      }).then()
    });
  })
}

app.use('/users', usersRouter);
app.use('/rooms', roomsRouter);
app.use('/valorations',valorationsRouter);
app.use('/comments',commentsRouter)
app.use('/images',imagesRouter)

module.exports = app;

