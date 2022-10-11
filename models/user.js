const Joi = require("joi");
const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, "Set password for user"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  avatarURL: {
    type: String,
    require: true,
  },
  token: {
    type: String,
    default: ""
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, 'Verify token is required'],
  },
});

// const registerSchema = Joi.object({
//     password: Joi.string().required(),
// })

const User = model("user", userSchema);

module.exports = User;
