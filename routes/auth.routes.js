const router = require("express").Router();
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const User = require("../models/User.model")
const verifyToken = require("../middlewares/auth.middlewares")

router.post("/signup", async (req, res, next) => {
  const { email, password, username } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ errorMessage: "Los siguientes campos son requeridos (username, email, password)" });
  }

  let regexPassword = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
  if (!regexPassword.test(password)) {
    return res.status(400).json({ errorMessage: "La contraseña no es valida. Debe contener al menos una letra, un numero, un caracter especial y tener entre 8 y 16 caracteres." });
  }

  try {
    const foundEmail = await User.findOne({ email });
    const foundUsername = await User.findOne({ username });

    if (foundEmail) return res.status(400).json({ errorMessage: "Ya existe un usuario con ese correo electronico" });
    if (foundUsername) return res.status(400).json({ errorMessage: "Username no disponible" });

    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      email,
      password: hashPassword,
      username,
    });

    // Generar JWT
    const payload = { _id: newUser._id, username: newUser.username };
    const token = jwt.sign(payload, process.env.SECRET_TOKEN, { expiresIn: "6h" });

    // Devolver token directamente
    res.status(201).json({ authToken: token, user: { username: newUser.username, email: newUser.email } });

  } catch (error) {
    next(error);
  }
});

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