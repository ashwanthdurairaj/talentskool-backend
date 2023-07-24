const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
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

  const { code } = req.query;

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
    const details = oAuth2Client.credentials;
    console.log('credentials',details);
    await getUserData(oAuth2Client.credentials.access_token);

    const oauth2 = google.oauth2({ auth: oAuth2Client, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();
    console.log(userInfo.data)
    const userEmail = userInfo.data.email;
    console.log(userEmail)
    // res.send(`Logged in with email: ${userEmail}`);
    //userInfo.data.email
    //userInfo.data.name
    //storing the above information in mongodb is still remaining
    
    const userExists = await User.findOne({email: userEmail})
    console.log(userExists)
    if(!userExists)
    {
      const user = await User.create({
        username: userInfo.data.name,
        email: userInfo.data.email,
    })
    }
    res.redirect('http://localhost:3000')
  // catch (error) {
  //   console.error('Error retrieving user information:', error.message);
  //   res.status(500).send('Error retrieving user information');
  // }
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
  

module.exports = {
  register,
  googleLoginRequest,
  OAuth,
}