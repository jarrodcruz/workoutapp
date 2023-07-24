const User = require("../models/User");
const Workout = require("../models/Workout");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc get all users
// @route GET /users
// @access Private

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean(); // find all users and return the data without password and methods
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});

// @desc create new users
// @route POST /users
// @access Private

const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;
  // validate data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are REQUIRED" });
  }
  // check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }
  // hash user password
  // dont want db to hold their pw
  const hashedPW = await bcrypt.hash(password, 15); // hash it 15 times for security in db
  const userObject = { username, password: hashedPW, roles };

  // store and create new user
  const user = await User.create(userObject);

  if (user) {
    // created
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    // error creating user
    res
      .status(400)
      .json({ message: "Unable to creater user. Invalid user data received" });
  }
});

// @desc update a user
// @route PATCH /users
// @access Private

const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;
  // validate data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  // duplicate check
  const duplicate = await User.findOne({ username }).lean().exec();
  // Allow update to original user
  if (duplicate && duplicate?._id.toString() !== id) {
    // have a duplicate
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.userName = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // if they provide a new password, hash it and update it
    user.password = await bcrypt.hash(password, 15);
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.userName} updated` });
});

// @desc delete a user
// @route DELETE /users
// @access Private

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "UserID required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
