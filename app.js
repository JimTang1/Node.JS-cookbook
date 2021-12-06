const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const cors = require('cors');

const errorController = require('./controllers/error');
const User = require('./models/user');

const corsOptions = {
  origin: "https://cse341-cookbook.herokuapp.com/",
  optionsSuccessStatus:200
};

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  family: 4
};

const mysql_options = {
	host: 'trentonsouth.com',
	port: 3306,
	user: 'trenton_cookbook',
	password: '0urProj3ct',
	database: 'trenton_cookbook'  
}

var sessionStore = new MySQLStore(mysql_options);

const memberRoutes = require('./routes/member');
const adminRoutes = require('./routes/admin');
const visitorRoutes = require('./routes/visitor');
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');


const app = express();

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination:(req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    let timestamp = Date.now()
    cb(null, timestamp + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(multer({storage: fileStorage, fileFilter:fileFilter}).single('image'));
app.use(express.static(path.join(__dirname,'public')));
app.use('/images', express.static(path.join(__dirname,'images')));

app.use(
  session({
    secret: 'ridibibadowbut',
    resave: false,
    saveUninitialized: false,
    store: sessionStore
  })
);

app.use(cors(corsOptions));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.recipesPage) {
    req.session.recipesPage = 1;
  }

  if (!req.session.recipesPageCommand) {
    req.session.recipesPageCommand = "first";
  }

  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  let user = new User();
  user.getById(req.session.user.Id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/member', memberRoutes);
app.use('/admin', adminRoutes);
app.use(visitorRoutes);
app.use(authRoutes);
app.use(searchRoutes);

// app.get('/500', errorController.get500);

app.use(errorController.get404);

// app.use((error, req, res, next) => {
//   res.status(500).render('500', {
//     pageTitle: 'Error!',
//     path: '/500',
//     isAuthenticated: req.session != undefined ? req.session.isLoggedIn : false,
//     user: req.user != undefined ? req.user.FirstName : 'Guest'
//   });
// });

 
app.listen(process.env.PORT || 5000);
