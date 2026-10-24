const User = require('../models/User');
const Resume = require('../models/Resume');
const AnalysisReport = require('../models/AnalysisReport');
const { logActiTechy } = require('../services/actiTechyLogger');

// CREATE User
exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim()
    });
    await user.save();

    await logActiTechy('USER_CREATED', { userId: user._id, name: user.name, email: user.email }, user._id);
    return res.status(201).json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// READ All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// READ User by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// UPDATE User
exports.updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.toLowerCase().trim();

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await logActiTechy('USER_UPDATED', { userId: user._id, updates }, user._id);
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE User (Cascades to resumes and reports)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Cascade delete related records
    await Resume.deleteMany({ userId: user._id });
    await AnalysisReport.deleteMany({ userId: user._id });

    await logActiTechy('USER_DELETED', { userId: user._id, email: user.email }, user._id);
    return res.status(200).json({ message: 'User and associated records deleted successfully', userId: user._id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
