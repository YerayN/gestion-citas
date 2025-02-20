const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET_KEY = "clave_secreta_super_segura"; // 🔐 Debes cambiar esto en producción

// Usuario de ejemplo (esto se guardaría en la base de datos en producción)
const adminUser = {
  username: "admin",
  password: bcrypt.hashSync("1234", 10), // 🔐 Hasheado para mayor seguridad
};

// Endpoint de login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username !== adminUser.username) {
    return res.status(401).json({ error: "Usuario incorrecto" });
  }

  // Comparar contraseña con hash
  const passwordMatch = bcrypt.compareSync(password, adminUser.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  // Crear token JWT con expiración de 2 horas
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "2h" });

  res.json({ token });
});

// Middleware para verificar el token en rutas protegidas
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: "Acceso denegado, token requerido" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(401).json({ error: "Token inválido o expirado" });
    }
    req.user = user;
    next();
  });
};

module.exports = { router, verificarToken };
