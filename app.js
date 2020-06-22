const express = require('express');
const mongose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const connectDB = require('./config/db');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

//Load config
dotenv.config({ path: './config/config.env' });
require('./config/passport')(passport);

connectDB();
const app = express();

if(process.env.NODE_ENV == 'development'){
	app.use(morgan('dev'));
}

//Handlebars
app.engine('.hbs', exphbs({defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');

//Sessions
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({  mongooseConnection: mongose.connection })
}))

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));

//Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));




const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
	console.log("StoryBooks Has Started");
	console.log(`Server is listening at ${process.env.NODE_ENV} mode on port ${PORT}`);
});
