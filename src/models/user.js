const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

// Create Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Built in validator
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      },
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error('Password is invalid');
        }
      },
    },

    age: {
      type: Number,
      default: 0,

      // customise validation
      validate(value) {
        if (value < 0) {
          throw new Error('Age must be a positive number');
        }
      },
    },

    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },

  {
    timestamps: true,
  }
);

// userSchema.virtual('name_for_our_virtual_field',{object} )
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id', // to store local data of owner object id.
  foreignField: 'owner', // other thing of relationship. Task-owner
});

/*
Here we use standard function method because we need to binding with our
middleware.

Static methods: are accessible on the model sometimes called model_method.

Methods: are accessible on instances sometimes called instance methods.

getPublicProfile = toJSON
JSON allows us to manipulate object and here we hide password
*/
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  // "this" allowing us to access user
  const user = this;

  // Generate JWT
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

/* 
this function receive 2 argument. we can indeed use an arrow function as
the this binding isn't going to play a role. 
*/
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

// Middleware function
// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
  //this gives us access to the individual user thats about to be saved.
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
  /*
   when our all process done then we call next() at the end of the 
   function, if we never call next, its just going to hang forever and don't
   save the user.
   */
});

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});
// Create Model
// use capital letter to create model(also a constructor)
const User = mongoose.model('User', userSchema);

// to use model from another directory export it as module.
module.exports = User;
