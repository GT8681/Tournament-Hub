const User = require('../user/User.schema');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// 1. LOGICA DI REGISTRAZIONE
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Questo utente esiste già.' });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: 'Utente registrato con successo!' });
  } catch (error) {
    res.status(500).json({ message: 'Errore durante la registrazione.', error: error.message });
  }
};

// 2. LOGICA DI LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // ⬅️ Cambiamo questo messaggio per essere super chiari!
      return res.status(404).json({ message: 'Questa e-mail non è registrata nei nostri sistemi.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password errata. Riprova.' });
    }

    const token = jwt.sign(
      { userId: user._id, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Errore durante il login.', error: error.message });
  }
};

