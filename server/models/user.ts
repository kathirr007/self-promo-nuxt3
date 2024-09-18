import type { User } from './types/user'
// import { compare, genSalt, hash } from 'bcryptjs'
import * as Bcrypt from 'bcryptjs'
import { model, Schema } from 'mongoose'

// const Schema = mongoose.Schema

const userSchema = new Schema<User>({
  avatar: String,
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
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
    required: true,
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
  // eslint-disable-next-line ts/no-this-alias
  const user = this

  Bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err)
    }

    Bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err)
      }

      user.password = hash
      next()
    })
  })
})

// Every user have access to this methods
userSchema.methods.comparePassword = function (candidatePassword: string, callback: (...args: any) => void) {
  // debugger;
  Bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return callback(err)
    }
    else {
      callback(null, isMatch)
    }
  })
}

const UserModel = model('User', userSchema)

export default UserModel
