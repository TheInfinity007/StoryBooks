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

//Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json())

if(process.env.NODE_ENV == 'development'){
	app.use(morgan('dev'));
}

//Handlebars Helpers
const { formatDate, stripTags, truncate, editIcon } = require('./helpers/hbs');

//Handlebars
app.engine('.hbs', exphbs({helpers: { formatDate, stripTags, truncate, editIcon}, defaultLayout: 'main', extname: '.hbs'}));
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

//set global var
app.use(function(req, res, next){
	res.locals.user = req.user || null;
	next();
})

app.use(express.static('public'));

//Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));




const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
	console.log("StoryBooks Has Started");
	console.log(`Server is listening at ${process.env.NODE_ENV} mode on port ${PORT}`);
});
