import * as express from 'express'
import {writeJsonResponse} from '../../utils/express.js'
 
export function hello(req, res) {
  const name = req.query.name || 'stranger'
  writeJsonResponse(res, 200, {"message": `Hello, ${name}!`})
}


export function goodbye(req, res) {
  const userId = res.locals.auth.userId
  writeJsonResponse(res, 200, {"message": `Goodbye, ${userId}!`})
}