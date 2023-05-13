import * as express from 'express';

import UserService from '../services/user.js';
import {writeJsonResponse} from '../../utils/express.js'
import logger from '../../utils/logger.js';

export function refreshAuthToken(req, res) {
  const {refreshToken} = req.body;
  // UserService
}

export function auth(req, res, next ) {
  const token = req.headers.authorization;
  UserService.auth(token)
      .then(authResponse => {
          if(!authResponse.error) {
              res.locals.auth = {
                  userId: authResponse.userId
              }
              next()
          } else {
              writeJsonResponse(res, 401, authResponse)
          }
      })
      .catch(err => {
          writeJsonResponse(res, 500, {error: {type: 'internal_server_error', message: 'Internal Server Error'}})
      })
}

export function createUser(req, res) {
  const {email, password, name} = req.body

  UserService.createUser(email, password, name)
    .then(resp => {
      if ((resp).error) {
        if ((resp).error.type === 'account_already_exists') {
          writeJsonResponse(res, 409, resp)
        } else {
          throw new Error(`unsupported ${resp}`)
        }
      } else {
        writeJsonResponse(res, 201, resp)
      }
    })
    .catch((err) => {
      logger.error(`createUser: ${err}`)
      writeJsonResponse(res, 500, {error: {type: 'internal_server_error', message: 'Internal Server Error'}})
    })
}

export function login(req, res) {
  const {email, password} = req.body

  UserService.login(email, password)
    .then(resp => {
      if ((resp).error) {
        if ((resp).error.type === 'invalid_credentials') {
          writeJsonResponse(res, 404, resp)
        } else {
          throw new Error(`unsupported ${resp}`)
        }
      } else {
        const {userId, token, expireAt} = resp
        writeJsonResponse(res, 200, {userId: userId, token: token}, {'X-Expires-After': expireAt.toISOString()})
      }
    })
    .catch((err) => {
      logger.error(`login: ${err}`)
      writeJsonResponse(res, 500, {error: {type: 'internal_server_error', message: 'Internal Server Error'}})
    })
}