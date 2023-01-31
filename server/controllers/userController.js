const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Token = require("../models/tokenModel");

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

// Get Login Status
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // Verify Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

  // Logout User
  const logoutUser = asyncHandler(async (req, res) => {
    res.cookie("token", "", {
      path: "/",
      httpOnly: true,
      expires: new Date(0),
      sameSite: "none",
      secure: true,
    });
    return res.status(200).json({ message: "Successfully Logged Out" });
  });


  // Get all User Data
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ user: req.user.id }).sort("-createdAt");
  res.status(200).json(users);
});

// Get User Data
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { _id, username, email, isAvatarImageSet, avatarImage } = user;
    res.status(200).json({
      _id,
      username,
      email,
      isAvatarImageSet,
      avatarImage,
    });
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

 // Update User
 const updateUser = asyncHandler(async (req, res) => {
   
  const user = await User.findById(req.user._id);

  if (user) {
    const { username, email, isAvatarImageSet, avatarImage } = user;
    user.email = email;
    user.username = req.body.username || username;
    user.isAvatarImageSet = req.body.isAvatarImageSet || isAvatarImageSet;
    user.avatarImage = req.body.avatarImage || avatarImage;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAvatarImageSet: updatedUser.isAvatarImageSet,
      avatarImage: updatedUser.avatarImage,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

 //Change Password 
 const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }
  //Validate
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please add old and new password");
  }

  // check if old password matches password in DB
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  // Save new password
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).send("Password change successful");
  } else {
    res.status(400);
    throw new Error("Old password is incorrect");
  }
});  


// Set Image
const setAvatar = asyncHandler(async (req, res, next) => {
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
  setAvatar,
  logoutUser,
  getUser,
  getUsers,
  loginStatus,
  updateUser,
  changePassword,
  // forgotPassword,
  // resetPassword
};
