import bcrypt from 'bcrypt'
import {Schema, Document, model, Model} from 'mongoose'

import validator from 'validator'

// interface IUserDocument extends Document {
//   password: string
//   email: string
//   name: string
//   created: Date
// }

// export interface IUser extends IUserDocument {
//   // document level operations
//   comparePassword(password: string): Promise<boolean> 
// }

const userSchema = new Schema({
  password: {type: String, required: true},
  email: {type: String, required: true, trim: true, validate: [validator.isEmail, 'do not match email regex']},
  name: {type: String, required: true},
  created: {type: Date, default: Date.now},
  expiredAt: {type: Date, required: true, default: Date.now}
}, {strict: true})
  .index({email: 1}, {unique: true, collation: {locale: 'en_US', strength: 1}, sparse: true})

//   when we save a user, we don’t save password in readable format, its password is hashed using bcrypt
userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    // generate hash for password
    bcrypt.genSalt(10, (err, salt) => {
      /* istanbul ignore next */
      if (err) return next(err)
      bcrypt.hash(this.password, salt, (err, hash) => {
        /* istanbul ignore next */
        if (err) return next(err)
        this.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

// user.toJSON() will return nice output without redundant properties.
userSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.created = ret.created.getTime()

    delete ret.__v
    delete ret._id
    delete ret.password
  }
})

// comparePassword is used to check if password is valid, required for login operation.
userSchema.methods.comparePassword = function(candidatePassword) {
  const {password} = this
  return new Promise(function(resolve, reject) {
    bcrypt.compare(candidatePassword, password, function(err, isMatch) {
      /* istanbul ignore next */
      if (err) return reject(err)
      return resolve(isMatch)
    })
  })
}

// export interface IUserModel extends Model<IUser> {
//   // collection/docouments level operations (fetch one or many, update, save back to db)
// }

export const User = model('User', userSchema)

export default User