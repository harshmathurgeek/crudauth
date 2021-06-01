const localStr=require('passport-local').Strategy//defining the local strategy
const User=require('./model')//user model
const bcrypt=require('bcrypt')//using to compare hashpw
function init(passport)//reciving whole liabbry thorugh parameter
{
passport.use(new localStr({usernameField:'email'},async (email,password,done)=>{
    //defing the srategy and usernameField('emAIL) and getting all email and passwod from form
//check if email exits

const user=await User.findOne({email:email})//finding user with given email
if(!user)
{
    return done(null,false,{message:'No user with this email'})//theer is no user returning message will print on front end
    //and this return will go too the authCon.js and postlogin method
}
bcrypt.compare(password,user.password).then(match=>//comparing password
    {
     if(match)
     {
         return done(null,user,{message:'logged in succsefully'})
    //and this return will go too the authCon.js and postlogin method

     }
    return done(null,false,{message:'Wrong Password'})
    //and this return will go too the authCon.js and postlogin method


    }).catch(err=>
        {
          console.log(err);
            return done(null,false,{message:'Something went wrong'})
        })

}));


passport.serializeUser((user,done)=>//storiing the whole user object in session  
{
done(null,user._id)//saving the user details into session through user._id 
})  
passport.deserializeUser((id, done) => {//getting all the information of user from id
    User.findById(id, (err, user) => {
        done(err, user)
    })
    
})
}
module.exports = init