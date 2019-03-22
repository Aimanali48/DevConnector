const express   = require('express')
       router   = express.Router(),
       gravatar = require('gravatar'),
       bcrypt   = require('bcryptjs'),
       jwt      = require('jsonwebtoken'),
       passport = require('passport'),
       key = require('../../config/keys')

const User = require('../../mongo/models/User')
const validateRegisterInput = require('../../validators/resgister')
const validateLoginInput = require('../../validators/login')

router.get('/', (req, res) => {
    res.send('users succeed')
})



//USER REGISTRATION

router.post('/register', (req,res)=>{

    //Validation Check
    const {errors , isValid} = validateRegisterInput(req.body)
    if(!isValid){
        return res.status(400).json(errors)
    }


    User.findOne({email : req.body.email})
    .then(user=>{
        if(user){
            return res.status(400).send('Email already exist')
        }
        else {
            const avatar = gravatar.url(req.body.email ,{
                s:'200',
                r: 'pg',
                d:'mm'
            })

            const newUser = new User({
                name:req.body.name,
                email:req.body.email,
                password:req.body.password,
                avatar
            })

            bcrypt.genSalt(10,(err,salt)=>{
             bcrypt.hash(newUser.password, salt,(err,hash)=>{
                 if (err) throw err
                 newUser.password = hash
                 newUser.save()
                 .then(user => res.json(user))
                 .catch(err => console.log(err))
             })
            })
        }
    })
})



//LOGIN VERIFICATION
router.post('/login', (req,res)=>{
    //Validation Check
    const {errors , isValid} = validateLoginInput(req.body)
    if(!isValid){
        return res.status(400).json(errors)
    }


    email = req.body.email
    password = req.body.password

    //Checking for email
    User.findOne({email}).then(user => {
        if(!user){
            return res.status(404).json({email :'user not found'})
        }

    //Checking for password
    bcrypt.compare(password,user.password).then(isMatch => {
        if(isMatch){

            //Create JWT after verification
           const payload = {id : user.id, name:user.name, avatar:user.avatar}
            jwt.sign(payload,
                 key.secretOrKey,
                 {expiresIn:3600},
                 (err, token)=>{
                     res.json({
                         success:true,
                         token : 'Bearer ' + token
                     })
                 })

        } else {
            return res.status(404).json({password:'password incorrect'})
        }
    })
  })
})

//Protected Route : 
router.get('/current',passport.authenticate('jwt',{session:false}),(req,res)=>{
    res.json({
        id: req.user.id,
        email : req.user.email,
        name : req.user.name
    })
} )

module.exports = router