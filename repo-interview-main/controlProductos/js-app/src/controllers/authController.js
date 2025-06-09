const jwt = require('jsonwebtoken');
const users = require('../data/users');

exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!users[username] || users[username] !== password) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
};
