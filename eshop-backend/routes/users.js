const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");
  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

router.get(`/:id`, async (req, res) => {
  const userList = await User.findById(req.params.id).select("-passwordHash");
  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

router.post(`/`, async (req, res) => {
  try {
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    });
    user = await user.save();
    if (!user) {
      return res.status(400).send("User cannot be created");
    } else {
      return res
        .status(200)
        .send({ user: user, message: "User created successfully" });
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});
router.put(`/:id`, async (req, res) => {
  const userExist = await User.findById(req.params.id);
  let newPassword;
  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = userExist.passwordHash;
  }
  let user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    },
    { new: true }
  );
  if (!user) {
    return res.status(400).send("User cannot be created");
  } else {
    return res
      .status(200)
      .send({ user: user, message: "User created successfully" });
  }
});
router.post(`/login`, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).send("User not found!");
  } else {
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      const token = jsonwebtoken.sign(
        {
          userId: user.id,
          isAdmin: user.isAdmin,
        },
        process.env.SECRETE_KEY,

        { expiresIn: "1d" }
      );
      return res.status(200).send({
        user: user.email,
        token: token,
      });
    } else {
      return res.status(404).send("Invalid login details");
    }
  }
});
router.post(`/register`, async (req, res) => {
  try {
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    });
    user = await user.save();
    if (!user) {
      return res.status(400).send("User cannot be created");
    } else {
      return res
        .status(200)
        .send({ user: user, message: "User created successfully" });
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});
router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments();
  if (!userCount) {
    return res.status(400).json({ success: false, message: "User not found!" });
  }
  return res.status(200).json({ count: userCount });
});
router.delete(`/:id`, async (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(400).send("User cannot found");
      } else {
        return res.status(200).json({
          success: true,
          message: "The user is successfully deleted",
        });
      }
    })
    .catch((err) => {
      return res.status(400).send({ success: false, message: err });
    });
});
module.exports = router;
