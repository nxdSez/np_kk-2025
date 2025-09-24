const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
  try {
    //code
    const { email, password } = req.body
    if (!email) {
      return res.status(400).json({ message: "Email is required!!!" })
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required!!!" })
    }
    // Check Email in DB already exist?
    const user = await prisma.user.findFirst({
      where: {
        email: email
      }
    })

    if (user) {
      return res.status(400).json({ message: "Email already exist!!!" })
    }

    // HashPassword
    const hashPassword = await bcrypt.hash(password, 10)

    // Register
    await prisma.user.create({
      data: {
        email: email,
        password: hashPassword
      }
    })

    res.send('Register Success')


    console.log(email, password)
    res.send('Hello Register Controllers')
  } catch (err) {
    //err
    console.log(err)
    res.status(500).json({ message: "Server Register Error" })
  }
}

exports.login = async (req, res) => {
  try {
    //code
    const { email, password } = req.body

    // Check Email
    const user = await prisma.user.findFirst({
      where: {
        email: email
      }
    })
    if (!user || !user.enabled) {
      return res.status(400).json({ massage: 'User Not found or not Enable' })
    }
    // Check Password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(500).json({ message: 'Password Invalid' })
    }
    // Create Payload
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    }

    // Generate Token
    jwt.sign(payload, process.env.SECRET, {
      expiresIn: '7d'
    }, (err, token) => {
      if (err) {
        return res.status(500).json({ message: 'Server Token Error' })
      }
      res.json({ payload, token })
    })
  } catch (err) {
    //err
    console.log(err)
    res.status(500).json({ message: "Server Login Error" })
  }
}

exports.currentUser = async (req, res) => {
  try {
    //code
    const user = await prisma.user.findFirst({
      where: {
        email: req.user.email
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true
      }
    })
    res.json({ user })
  } catch (err) {
    //err
    console.log(err)
    res.status(500).json({ message: "Server User Error " })
  }
}
