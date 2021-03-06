const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')



const { User } = require('../models/user.model')
const { UserDto } = require('../dto/user.dto')
const { JWT_KEY } = require('../config/keys')
const signInValidator = [
    body('email').exists().notEmpty().isEmail().withMessage('You must Enter a Valid Email'),

]
router.post('/signin', signInValidator, async(req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) res.status(401).json({ errors: errors.array() })
    const { email, password } = req.body;
    //check if user exist
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" })

    //check if correct password
    const validPassword = bcrypt.compareSync(password, user.password)
    if (!validPassword) return res.status(400).json({ msg: "Invalid Credentials" })

    //formate the user data 
    const data = UserDto(user)

    //create a token for the connection
    const token = jwt.sign(data, JWT_KEY)

    //return the data within the token
    res.json({ user: data, token, accounts: user.accounts, transactions: user.transactions })
})
router.post('/signup', async(req, res) => {
    const { email, password, name } = req.body
        // check if user existed
    const existedUser = await User.findOne({ email })
    if (existedUser) return res.status(400).json({ msg: "User Already Exists" })

    //hash the password
    const hashedPassword = bcrypt.hashSync(password, 10)

    // create new user 
    const user = new User({
        email,
        name,
        password: hashedPassword
    })
    await user.save()
    res.status(201).json({ msg: "User Created Successfully" })

})

module.exports = router