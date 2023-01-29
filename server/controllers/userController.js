const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
// const Token = require("../models/tokenModel");

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// REGISTER USER
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Validation
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up to 6 characters");
  }

  // Check if user username already exists
  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(400);
    throw new Error("Username has already been registered");
  }

  // Check if user email already exists
  const emailExists = await User.findOne({ email });

  if (emailExists) {
    res.status(400);
    throw new Error("Email has already been registered");
  }

  // Create new user
  const user = await User.create({
    username,
    email,
    password,
  });

  //   Generate Token
  const token = generateToken(user._id);

  // Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    secure: true,
  });

  if (user) {
    const { _id, username, email, isAvatarImageSet, avatarImage } = user;
    res.status(201).json({
      _id,
      username,
      email,
      isAvatarImageSet,
      avatarImage,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validate Request
  if (!username || !password) {
    res.status(400);
    throw new Error("Please add username and password");
  }

  // Check if user exists
  const user = await User.findOne({ username });

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  // User exists, check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  //   Generate Token
  const token = generateToken(user._id);

  // Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    secure: true,
  });

  if (user && passwordIsCorrect) {
    const { _id, username, email, isAvatarImageSet, avatarImage } = user;
    res.status(200).json({
      _id,
      username,
      email,
      isAvatarImageSet,
      avatarImage,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

// Set Image
const setAvatar = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
});

module.exports = {
  registerUser,
  loginUser,
  setAvatar
  // logoutUser,
  // getUser,
  // loginStatus,
  // updateUser,
  // changePassword,
  // forgotPassword,
  // resetPassword
};
