const express = require("express");
const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const path = require("path");
const jimp = require("jimp");

const { authenticate, upload } = require("../../middlewares");

const { RequestError } = require("../../helpers");

const { SECRET_KEY } = process.env;

const avatarsDir = path.join(__dirname, "../../", "public", "avatars")

const router = express.Router();

const userSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const { error } = userSchema.validate(req.body);
    if (error) {
      throw RequestError(400, "missing required name field");
    }
    if (user) {
      throw RequestError(409, "Email in use");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const result = await User.create({ email, password: hashPassword, avatarURL });
    res.status(201).json({
      email: result.email,
      avatarURL: result.avatarURL,
      subscription: result.subscription,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const { error } = userSchema.validate(req.body);
    if (error) {
      throw RequestError(400, "missing required name field");
    }
    if (!user) {
      throw RequestError(401, "Email or password is wrong");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw RequestError(401, "Email or password is wrong");
    }
    const payload = {
      id: user._id,
    };
    const { subscription } = user;
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
    await User.findByIdAndUpdate(user._id, {token})
    res.status(200).json({
      token,
      user: {
        email,
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/avatars", authenticate, upload.single("avatar"), async (req, res, next) => {
  try {
    const {path: tempUpload, originalname} = req.file;
    const {_id} = req.user;
    const extension = originalname.split(".").pop();
    const filename = `${_id}.${extension}`;
    const resultUpload = path.join(avatarsDir, filename)
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", filename);
    await User.findByIdAndUpdate(_id, {avatarURL});
    await jimp.read(`./public/avatars/${filename}`).then(image => {
     return image.resize(250, 250).write(`./public/avatars/${filename}`)
    });
    res.json({
      avatarURL,
    })
  } catch(error) {
    next(error)
  }
});

router.get("/current", authenticate, async (req, res, next) => {
  const { email, subscription} = req.user;
  res.json({
    email,
    subscription,
  });
});

router.get("/logout", authenticate, async (req, res, next) => {
  const {_id} = req.user;
  await User.findByIdAndUpdate(_id, {token: ""})
  res.json({
    message: "Logout success"
  });
});

module.exports = router;
