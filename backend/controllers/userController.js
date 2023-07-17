const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken')
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
  getMe
}