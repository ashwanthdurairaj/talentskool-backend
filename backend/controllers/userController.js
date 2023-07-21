const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken')
const {OAuth2Client} = require('google-auth-library')


//post method, used to ping the auth url from the frontend
const googleLoginRequest = asyncHandler(async(req, res) => {

  res.header('Referrer-Policy', 'no-referrer-when-downgrade')

  const redirectUrl = 'http://127.0.0.1:3000/oauth'

  const oAuth2Client = new OAuth2Client(
    process.env.clientID,
    process.env.CLIENT_SECRET,
    redirectUrl,
  )

  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/userinfo.profile openid ',
    prompt: 'consent'
  });

  res.json({url: authorizeUrl})

})

const getUserData = async(access_token) => {
  const response = await fetch(`https://googleapis.com/oauth2/v3/userinfo?access_tokens${access_token}`)
  const data = await response.json()
  console.log('data', data)
}

//get method
const OAuth = asyncHandler(async(req, res) => {

  const code = req.query.code
  try {
    const redirectURL = "http://127.0.0.1:3000/oauth"
    const oAuth2Client = new OAuth2Client(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        redirectURL
      );
    const r =  await oAuth2Client.getToken(code);
    // Make sure to set the credentials on the OAuth2 client.
    await oAuth2Client.setCredentials(r.tokens);
    console.info('Tokens acquired.');
    const user = oAuth2Client.credentials;
    console.log('credentials',user);
    await getUserData(oAuth2Client.credentials.access_token);

  } catch (err) {
    console.log('Error logging in with OAuth2 user', err);
  }


  res.redirect(303, 'http://localhost:5173/');

})

const register = asyncHandler(async(req, res) => {
    const {username, email, password} = req.body
    console.log(req.body)
    if(!username || !password || !email)
    {
        res.status(400)
        throw new Error('Please add all fields')
    }

    const userExists = await User.findOne({email})
    console.log(userExists)
    if(userExists)
    {
        res.status(400)
        throw new Error('User already exists')
    }

    const user = await User.create({
        username: username,
        email: email,
        password: password
    })

    if (user) {
        res.status(201).json({
          status:'success',
          token: generateToken(user._id),
          user: {
            _id: user.id,
            name: user.username,
            email: user.email,  
          }
        })
      } else {
        res.status(400)
        throw new Error('Invalid user data')
      }
})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
  
    // Check for user email
    
    const user = await User.findOne({ email })
    console.log(user)
    console.log(password)
    if (user && password == user.password) {
      res.json({
        message: 'success',
        token: generateToken(user._id),
        user: {
          _id: user.id,
          name: user.username,
          email: user.email,  
        }    })
    } else {
      res.json({message: 'Invalid Credentials'})
    }
  })
  
// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user)
  // console.log(req.body)
  // const user = await User.find({_id: req.body.id})
  // console.log(user[0])
  // res.status(200).json(user[0])
})
  
// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, 'fae32013r', {
    expiresIn: '30d',
  })
}

module.exports = {
  register,
  login,
  getMe,
  googleLoginRequest,
  OAuth
}