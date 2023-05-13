import * as express from 'express'

export function writeJsonResponse(res, code, payload, headers) {
  const data = typeof payload === 'object' ? JSON.stringify(payload, null, 2) : payload;
  res.writeHead(code, {...headers, 'Content-Type': 'application/json'})
  res.end(data)
}