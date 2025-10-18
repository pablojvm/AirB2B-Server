const router = require("express").Router();
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const User = require("../models/User.model")
const verifyToken = require("../middlewares/auth.middlewares")

router.post("/signup", async(req, res, next) => {
    const {email, password, username} = req.body
    if (!username || !email || !password) {
        res.status(400).json({ errorMessage: "Los siguientes campos son requeridos (username, email, password)" })
        return;
    }

    let regexPassword = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
    if (regexPassword.test(password) === false) {
        res.status(400).json({ errorMessage: "La contraseña no es valida. Debe contener al menos una letra, un numero, un caracter especial y tener entre 8 y 16 caracteres." })
    return;
    }

    try {
        const foundEmail = await User.findOne({email:email})
        const foundUsername = await User.findOne({username:username})

        if (foundEmail !== null) {
            res.status(400).json({ errorMessage: "Ya existe un usuario con ese correo electronico" })
            return;
        }
        if (foundUsername !== null) {
            res.status(400).json({ errorMessage: "Username no disponible" })
            return;
        }

        const hashPassword = await bcrypt.hash(password, 12)

        await User.create({
            email,
            password:hashPassword,
            username
        })

        res.sendStatus(201)

    } catch (error) {
        next(error)
    }

})

router.post("/login", async(req,res,next) => {
    console.log("Todo Ok")

    const {username, password} = req.body

    if (!username || !password) {
        res.status(400).json({ errorMessage: "Todos los campos son obligatorios (username, password)" })
        return;
    }

    try {
        const foundUser = await User.findOne({username:username})

        if (foundUser === null) {
            res.status(400).json({ errorMessage: "Ningun usurio coincide con ese Username" })
            return;
        }

        const isPasswordCorrect = await bcrypt.compare( password, foundUser.password )
        if (isPasswordCorrect === false) {
            res.status(400).json({ errorMessage: "La contraseña no es válida" })
            return;
        }

        const payload = {
            _id:foundUser._id,
            username:foundUser.username
        }

        const authToken = jwt.sign(payload, process.env.SECRET_TOKEN,{
            algorithm:"HS256",
            expiresIn:"7d"
        })

        console.log('JWT_SECRET:', process.env.JWT_SECRET);


        res.status(200).json( { authToken } )

    } catch (error) {
        next(error)
    }

})

router.get("/verify", verifyToken, (req,res,next) =>{
    res.json({
        payload:req.payload
    })
})

module.exports = router