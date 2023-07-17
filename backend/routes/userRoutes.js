const express = require('express')
const router = express.Router()
const {
  register,
  login,
  getMe,
} = require('../controllers/userController')
const { protect } = require('../middlewares/authMiddleware')

router.post('/register', register)
router.post('/login', login)
router.get('/get', protect, getMe)
module.exports = router