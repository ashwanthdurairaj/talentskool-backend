const express = require('express')
const router = express.Router()
const {
  register,
  googleLoginRequest,
  OAuth,
} = require('../controllers/userController')
const { protect } = require('../middlewares/authMiddleware')

router.post('/register', register)
router.post('/request', googleLoginRequest)
router.get('/oauth', OAuth)

module.exports = router