const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const { sendWelcomeEmail, sendCancelationMail } = require("../emails/account");

// router.post('path or url', (calback_function(req,res ))=>{re})
router.post("/users", async (req, res) => {
  const user = new User(req.body); // constructor function require us to pass in an object with all of the attribute

  //To attempt to save the new user

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//we can read specific user only
// We can read all the data ('/users') or self profile('/users/me')
router.get("/users/me", auth, async (req, res) => {
  // to see self profile
  res.send(req.user);
});

// Update
router.patch("/users/me", auth, async (req, res) => {
  /*
  here "req.body" is an object. "object.keys()" accept object and return 
  an array of strings where each is a property on that object.
  */
  const updates = Object.keys(req.body); //its comes from request body
  const allowedUpdates = ["name", "email", "password", "age"];

  // every() is a call_back_function. Every return true or false
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "invalid updates!" });
  }

  try {
    // To avoid bypassed with middleware use step by step

    updates.forEach((update) => (req.user[update] = req.body[update])); // update user

    await req.user.save(); // save updated value

    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Delete
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelationMail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Please upload a image file"));
    }

    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 350, height: 350 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.status(200).send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

// Access image
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    //res.set('name_header_trying to set', 'wanted name to save' );
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router; // we export this as module
