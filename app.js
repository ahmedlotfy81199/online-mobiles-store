        const express = require('express');
        const flash = require('connect-flash');
        const app = express();
        const path = require('path');
        const exphbs  = require('express-handlebars');
        const mongoose=require('mongoose');
        const expressJoi = require('express-joi');
        const Joi = expressJoi.Joi;
        const bodyparser = require("body-parser");
        const bcrypt= require('bcryptjs');
        const passport = require('passport');
        const LocalStrategy= require('passport-local').Strategy;
        const session = require('express-session')


         //load user model
         require('./models/user');
         const User = mongoose.model('users');
       
         //connect to mongoose
         mongoose.Promise = global.Promise;
         mongoose.connect('mongodb://localhost/mobilestore-dev',{
             useMongoClient : true
         })
         .then(()=>console.log('DB connected ....'))
         .catch(error => console.log('error'))
         
  
//middle wares
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'puplic')));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))
app.use(flash());
        
       //config passport
       passport.use(new LocalStrategy(
        function(email, password, done) {
          User.findOne({ usernamefiled : email }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (!user.verifyPassword(password)) { return done(null, false); }
            return done(null, user);
          });
        }
      ));
     

        //routes
        app.get('/', function (req, res) {
            res.render('home');
        });
        app.get('/about', function (req, res) {
            res.render('about');
        });
        app.get('/user/register', function (req, res) {
            res.render('user/register');
        });
        app.get('/user/login', function (req, res) {
            res.render('user/login');
        });
        //login
        app.post('/user/login',passport.authenticate('local', { successRedirect: '/about',
        failureRedirect: '/user/login', failureFlash: true 

        
     })
);
        //regestration
        app.post('/user/register',(req,res)=>{
            let errors=[];
            if(req.body.password != req.body.confirmpassword){
                errors.push({text:'Password do not match' });
            };
            if(req.body.password.length < 5){
                errors.push({text:' Password must be at least 5 charcacters' })
            };
           
            if(errors.length>0){
                res.render('user/register',{
                    errors: errors,
                    username : req.body.username,
                    email: req.body.email,
                    password: req.body.password
                })
                
            }
         
            else{ 
                User.findOne({email: req.body.email})
                .then(user=>{
                    if(user){
                        errors.push({text: 'This email is registerd before'})
                            res.render('user/register',{
                                errors: errors,
                                username : req.body.username,
                                email: req.body.email,
                                password: req.body.password
                            })
                    }
                    else{
                        const newuser= new User( {
                            username: req.body.username,
                            email: req.body.email,
                            password: req.body.password
                        } )
                            bcrypt.genSalt(10,(err,salt)=>{
                            bcrypt.hash(newuser.password,salt,(err,hash)=>{
                                if(err) throw err;
                                newuser.password=hash;
                                newuser.save()
                                .then( User =>{
                                    res.redirect('/user/login')
                                    
                                
                                })
                                .catch(err=>{
                                    console.log(err);
                                    return;
                                })
        
                            })
        
                        })
                        
                    }
                })
                
                       
        }
        });
       
      
        
       
        
        const port=5000;
        app.listen(port,()=>{
            console.log(`server started on port ${port}`)
        });
        
