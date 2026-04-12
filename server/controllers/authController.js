const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/emailService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d',
  });
};

// Generate a secure random hex token and its 24-hour expiry
const generateVerificationToken = () => ({
  token: crypto.randomBytes(32).toString('hex'),
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
});

// Signup
exports.signup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Create new user (emailVerified defaults to false)
    const { token, expires } = generateVerificationToken();
    const user = new User({
      username,
      email,
      password,
      emailVerificationToken: token,
      emailVerificationExpires: expires,
    });

    await user.save();

    // Send verification email
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');
    const verifyUrl = `${clientUrl}?verify_token=${token}`;

    try {
      await sendVerificationEmail({ toEmail: email, toName: username, verifyUrl });
    } catch (emailErr) {
      console.error('Verification email failed to send:', emailErr.message);
      // Don't block signup if email fails — user can resend later
    }

    return res.status(201).json({
      message: 'Account created! Please check your email and verify your address before signing in.',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Signup failed' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Block login until email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Please verify your email address before signing in.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    // Generate token
    const token = generateToken(user._id);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        score: user.score,
        bio: user.bio,
        totalStoriesContributed: user.totalStoriesContributed,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
};

// Verify email via token
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');

    if (!token) {
      return res.redirect(`${clientUrl}?verified=false&reason=missing_token`);
    }

    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.redirect(`${clientUrl}?verified=false&reason=invalid_token`);
    }

    if (user.emailVerificationExpires < new Date()) {
      return res.redirect(`${clientUrl}?verified=false&reason=expired_token`);
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return res.redirect(`${clientUrl}?verified=true`);
  } catch (error) {
    console.error('Email verification error:', error);
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');
    return res.redirect(`${clientUrl}?verified=false&reason=server_error`);
  }
};

// Resend verification email
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });

    // Generic response to avoid user enumeration
    if (!user) {
      return res.json({ message: 'If that email exists in our system, a verification link has been sent.' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'This email is already verified. Please sign in.' });
    }

    const { token, expires } = generateVerificationToken();
    user.emailVerificationToken = token;
    user.emailVerificationExpires = expires;
    await user.save();

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');
    const verifyUrl = `${clientUrl}?verify_token=${token}`;

    await sendVerificationEmail({ toEmail: user.email, toName: user.username, verifyUrl });

    return res.json({ message: 'Verification email resent. Please check your inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ error: 'Failed to resend verification email' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { bio, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { bio, profileImage, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    return res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};
