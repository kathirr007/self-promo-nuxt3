import { compare, genSalt, hash } from 'bcryptjs'
import mongoose from 'mongoose'

const Schema = mongoose.Schema

const userSchema = new Schema({
  avatar: String,
  email: {
    type: String,
    required: 'Email is Required',
    lowercase: true,
    unique: true,
    // eslint-disable-next-line regexp/no-super-linear-backtracking
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})$/],
  },
  name: {
    type: String,
    required: true,
    minlength: [6, 'Too short, min is 6 characters'],
  },
  username: {
    type: String,
    required: true,
    minlength: [6, 'Too short, min is 6 characters'],
  },
  password: {
    type: String,
    minlength: [4, 'Too short, min is 4 characters'],
    maxlength: [32, 'Too long, max is 32 characters'],
    required: 'Password is required',
  },
  // Very simplified you should have separate collection with roles
  // You can create also array of roles in case of multiple roles
  role: {
    enum: ['guest', 'admin'],
    type: String,
    required: true,
    default: 'guest',
  },
  info: String,
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

userSchema.pre('save', function (next) {
  const user = this

  genSalt(10, (err, salt) => {
    if (err) {
      return next(err)
    }

    hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err)
      }

      user.password = hash
      next()
    })
  })
})

// Every user have acces to this methods
userSchema.methods.comparePassword = function (candidatePassword, callback) {
  // debugger;
  compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return callback(err)
    }
    else {
      callback(null, isMatch)
    }
  })
}

const UserModel = mongoose.model('User', userSchema)

export default UserModel
