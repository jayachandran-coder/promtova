const jwt = require('jsonwebtoken');
const User = require('../models/User');

const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Sync Firebase authenticated user to MongoDB and return standard JWT
// @route   POST /api/auth/firebase-sync
// @access  Public
const firebaseSync = async (req, res) => {
  const { firebaseToken } = req.body;

  if (!firebaseToken) {
    return res.status(400).json({ message: 'Firebase token is required' });
  }

  try {
    const decoded = jwt.decode(firebaseToken);
    
    if (!decoded || !decoded.iss || !decoded.iss.startsWith('https://securetoken.google.com/')) {
      return res.status(400).json({ message: 'Invalid Firebase ID token format' });
    }

    // Check expiration
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({ message: 'Firebase ID token has expired' });
    }

    const email = decoded.email;
    const name = decoded.name || email.split('@')[0];
    const picture = decoded.picture || '';

    if (!email) {
      return res.status(400).json({ message: 'Email not found in Firebase token' });
    }

    // Check if user exists in MongoDB
    let user = await User.findOne({ email });

    if (!user) {
      // Create a unique username
      let username = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!username) username = 'user' + Math.floor(1000 + Math.random() * 9000);
      
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        username = username + Math.floor(100 + Math.random() * 900);
      }

      // Generate a secure random password to satisfy required: true
      const randomPassword = crypto.randomBytes(16).toString('hex');

      user = await User.create({
        username,
        email,
        password: randomPassword,
        profileImage: picture
      });
    } else {
      // Update profile picture if it exists in Firebase but not in MongoDB
      if (picture && !user.profileImage) {
        user.profileImage = picture;
        await user.save();
      }
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      savedPrompts: user.savedPrompts,
      likedPrompts: user.likedPrompts,
      profileImage: user.profileImage,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Firebase sync error:', error);
    res.status(500).json({ message: 'Firebase authentication synchronization failed' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    return res.status(400).json({ message: 'Username already taken' });
  }

  const user = await User.create({
    username,
    email,
    password
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  firebaseSync
};
