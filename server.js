const express    = require('express'),
      bodyParser = require('body-parser') ,
      path       = require('path'),
      mongoose   = require('mongoose'),
      passport   = require('passport'),
      db         = require('./config/keys').mongoURI,
      app        = express()

const port       = process.env.PORT || 5000

//MONGOOSE CONNECTION 
mongoose.Promise = global.Promise
mongoose.connect(db,{useNewUrlParser:true})
.then(()=>console.log('Mongodb Connected'))
.catch(err=>console.log(err))


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended : true
}))

//PASSPORT MIDDLEWARE
app.use(passport.initialize())
require('./config/passport')(passport)


app.use('/api/users', require('./routes/api/users'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/posts', require('./routes/api/posts'))


// Server static assets if in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'));
  
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
  }


app.listen(port, ()=>{console.log(`server started at port ${port}`)})