const express = require('express')
const router = express.Router()
const {
  register,
  login,
  googleLoginRequest,
  OAuth,
  getMe,
} = require('../controllers/userController')
const { protect } = require('../middlewares/authMiddleware')

router.post('/register', register)
router.post('/login', login)
router.post('/request', googleLoginRequest)
router.get('/oauth', OAuth)
router.get('/get', protect, getMe)

module.exports = router