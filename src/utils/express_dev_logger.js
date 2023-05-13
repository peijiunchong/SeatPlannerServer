/* istanbul ignore file */

import express from 'express'

import logger from './logger.js'

export const expressDevLogger = (req, res, next) => {
  const startHrTime = process.hrtime()

  logger.http(`Request: ${req.method} ${req.url} at ${new Date().toUTCString()}, User-Agent: ${req.get('User-Agent')}`)
  logger.http(`Request Body: ${JSON.stringify(req.body)}`)

  const [oldWrite, oldEnd] = [res.write, res.end]
  const chunk = []
  ;(res.write) = function(chunk) {
    chunks.push(Buffer.from(chunk))
    ;(oldWrite).apply(res, arguments)
  }

  res.end = function(chunk) {
    if (chunk) {
      chunks.push(Buffer.from(chunk))
    }

    const elapsedHrTime = process.hrtime(startHrTime)
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6

    logger.http(`Response ${res.statusCode} ${elapsedTimeInMs.toFixed(3)} ms`)

    const body = Buffer.concat(chunks).toString('utf8')
    logger.http(`Response Body: ${body}`)
    ;(oldEnd).apply(res, arguments)
  }
  
  next()
}