import User from "../models/user.js";
import logger from "../../utils/logger.js";
import config from "../../config/index.js";
import jwt from "jsonwebtoken";
import fs from 'fs';

// export type ErrorResponse = {error: {type: string, message: string}}
// export type AuthResponse = ErrorResponse | {userId: string}
// export type CreateUserResponse = ErrorResponse | {userId: string}
// export type LoginUserResponse = ErrorResponse | {token: string, userId: string, expireAt: Date}

const privateKey = fs.readFileSync(config.privateKeyFile);
const privateSecret = {
  key: privateKey, 
  passphrase: config.privateKeyPassphrase
}
// token generation
const signOptions = {
  algorithm: 'RS256',
  expiresIn: '14d'
}

const publicKey = fs.readFileSync(config.publicKeyFile)
// token verification
const verifyOptions = {
  algorithms: ['RS256']
}

function createAuthToken(userId) {
  return new Promise(function(resolve, reject) {
    jwt.sign({userId: userId}, privateSecret, signOptions, (err, encoded) => {
      if(err === null && encoded !== undefined) {
        const expireAfter = 2 * 604800 /* two weeks */
        const expireAt = new Date();
        expireAt.setSeconds(expireAt.getSeconds() + expireAfter)
        
        resolve({token: encoded, expireAt: expireAt})
      } else {
        reject(err)
      }
    })
  })
}

async function login(login, password) {
  try {
    const user = await User.findOne({email: login});
    if (!user) {
      return {error: {type: 'invalid_credentials', message: 'Invalid Login/Password'}}
    }

    const passwordMatch = await user.comparePassword(password)
    if (!passwordMatch) {
      return {error: {type: 'invalid_credentials', message: 'Invalid Login/Password'}}
    }

    const authToken = await createAuthToken(user._id.toString())
    return {userId: user._id.toString(), token: authToken.token, expireAt: authToken.expireAt}
  } catch (err) {
    logger.error(`login: ${err}`)
    return Promise.reject({error: {type: 'internal_server_error', message: 'Internal Server Error'}})
  }
} 

function auth(bearerToken) {
  return new Promise(function(resolve, reject) {
      const token = bearerToken.replace('Bearer ', '');
      jwt.verify(token, publicKey, verifyOptions, (err, decoded) => {
        if (err === null && decoded !== undefined) {
          const d = decoded;
          if (d.userId) {
            resolve({userId: d.userId})
            return
          }
        }
        resolve({error: {type: 'unauthorized', message: 'Authentication Failed'}})
      })
  })
}

function createUser(email, password, name) {
    return new Promise(function(resolve, reject) {
      const user = new User({email: email, password: password, name: name})
      user.save()
        .then(u => {
          resolve({userId: u._id.toString()})
        })
        .catch(err => {
          if (err.code === 11000) {
            resolve({error: {type: 'account_already_exists', message: `${email} already exists`}})
          } else {
            logger.error(`createUser: ${err}`)
            reject(err)
          }
        })
    })
}


export default {auth: auth, createUser: createUser, createAuthToken: createAuthToken, login: login};