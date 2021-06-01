require('dotenv').config()
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const path=require('path')
const PORT=process.env.PORT || 80;
const moongose=require('mongoose');
const mod=require('./model');
moongose.set('useFindAndModify', false);
const url="mongodb+srv://cke_bakery:test@cluster0.au2sh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
moongose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
console.log("database has been connected") ;   
}).catch(()=>{
    console.log("can not connect to database");
})  
    
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
const passportInit =require('./passport')

passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(express.static('views'))//setting public folder as static which means compiler will look all the js and front end fiels in public folder by default
app.use(express.urlencoded({extended:false}));//so we can accces the form input values
app.use(express.json());//so we can send output as json
app.set('views', path.join(__dirname,'/views'))//setting up all the frontend file
app.set('view engine', 'ejs')

app.get('/', checkAuthenticated, (req, res) => {
  console.log(req.user)
  res.render('index.ejs', { user: req.user })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})
app.get('/:id',(req,res)=>{
 mod.findById(req.params.id,(err,doc)=>{
  if(!err)
  {
      res.render('update',{employee:doc})
  }
  else{
      console.log("can not get data of this user");
  }
})
});
app.post('/update',(req,res)=>{
  mod.findByIdAndUpdate({_id:req.body._id},req.body,{new:true},(err,doc)=>{
    if(!err){
        res.redirect('/');
    }
    else{
        console.log("can not update data");
    }
})
})
app.get("/delete/:id",(req,res)=>{
  mod.findByIdAndRemove(req.params.id,(err,doc)=>{
      if(!err){
          res.redirect('/login');
      }
      else{
          console.log("can not delete data");
      }
  })
})


app.post('/register', checkNotAuthenticated, async (req, res) => {
  var hashedPassword = await bcrypt.hash(req.body.password, 10)
  
  
  let data=new mod()
  data.name=req.body.name;
  data.email=req.body.email;
  data.password=hashedPassword
  data.save().then(()=>{
    console.log("data has been inserted");
res.redirect('/login'); 
}).catch(()=>{
    console.log("errore im inserting data");
})

})

app.post('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/register')
}

function checkNotAuthenticated(req, res, next) {

  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(PORT,()=>{
})