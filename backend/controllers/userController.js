const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken')
const {OAuth2Client} = require('google-auth-library')
const fetch = require("node-fetch");
const { google } = require('googleapis');

//post method, used to ping the auth url from the frontend
const googleLoginRequest = asyncHandler(async(req, res) => {

  res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.header("Access-Control-Allow-Credentials", 'true');
  res.header('Referrer-Policy', 'no-referrer-when-downgrade')

  const redirectUrl = 'http://localhost:5000/oauth'
  console.log('Function accessed')
  const oAuth2Client = new OAuth2Client(
    '261023161038-0fc7i4avnlqpc5vjtjh08eak9a0ck5qu.apps.googleusercontent.com',
    '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',
redirectUrl,
  )

  // const authorizeUrl = oAuth2Client.generateAuthUrl({
  //   access_type: 'offline',
  //   scope: 'https://www.googleapis.com/auth/userinfo.profile openid ',
  //   prompt: 'consent'
  // });
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline', // or 'online' for single-use tokens
    scope: ['https://www.googleapis.com/auth/userinfo.email'],
    prompt: 'consent'
  });

  console.log(authorizeUrl)

  res.json({url: authorizeUrl})

})

async function getUserData(access_token) {

  const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
  
  //console.log('response',response);
  const data = await response.json();
  console.log('data',data);
}


//get method
const OAuth = asyncHandler(async(req, res) => {

  // const code = req.query.code
  // try {
  //   const redirectURL = "http://localhost:5000/oauth"
  //   const oAuth2Client = new OAuth2Client(
  //       '261023161038-0fc7i4avnlqpc5vjtjh08eak9a0ck5qu.apps.googleusercontent.com',
  //       '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',
  //       redirectURL
  //     );
  //   const r =  await oAuth2Client.getToken(code);
  //   // Make sure to set the credentials on the OAuth2 client.
  //   await oAuth2Client.setCredentials(r.tokens);
  //   console.info('Tokens acquired.');
  //   const user = oAuth2Client.credentials;
  //   console.log('credentials',user);
  //   await getUserData(oAuth2Client.credentials.access_token);
  //   const ticket = await oAuth2Client.verifyIdToken({idToken: oAuth2Client.credentials.id_token,audience:'261023161038-0fc7i4avnlqpc5vjtjh08eak9a0ck5qu.apps.googleusercontent.com',});
  //   console.log(ticket)
  // } catch (err) {
  //   console.log('Error logging in with OAuth2 user', err);
  // }


  // res.redirect(303, 'http://localhost:3000/');

  const { code } = req.query;

  try {
    // Exchange the authorization code for an access token
    const redirectURL = "http://localhost:5000/oauth"
    const oAuth2Client = new OAuth2Client(
            '261023161038-0fc7i4avnlqpc5vjtjh08eak9a0ck5qu.apps.googleusercontent.com',
            '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',
            redirectURL
          );
    const tokenResponse = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokenResponse.tokens);

    // Fetch the user's email address
    const oauth2 = google.oauth2({ auth: oAuth2Client, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();
    console.log(userInfo.data)
    // The user's email address is available in userInfo.data.email
    const userEmail = userInfo.data.email;
    console.log(userEmail)
    res.send(`Logged in with email: ${userEmail}`);
    //userInfo.data.email
    //userInfo.data.name
    //storing the above information in mongodb is still remaining
  } catch (error) {
    console.error('Error retrieving user information:', error.message);
    res.status(500).send('Error retrieving user information');
  }

})

const register = asyncHandler(async(req, res) => {
    const {username, email, number} = req.body
    console.log(req.body)
    if(!username || !number || !email)
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
        number: number
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

const test = asyncHandler(async(req, res) => {
  console.log('Test function initiated')
  res.json({message: 'Test function initiated'})
})

module.exports = {
  register,
  login,
  getMe,
  googleLoginRequest,
  OAuth,
  test
}