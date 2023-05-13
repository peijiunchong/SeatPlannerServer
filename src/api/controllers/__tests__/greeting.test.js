import request from 'supertest'

import { createServer } from '../../../utils/server.js'
import { createDummyAndAuthorize } from '../../../test/user.js'
import db from '../../../utils/db.js'

beforeAll(async () => {
  await db.open()
  server = await createServer()
})

afterAll(async () => {
  await db.close()
})

describe('GET /hello', () => {
  it('should return 200 & valid response if request param list is empity', done => {
    request(server)
      .get(`/api/v1/hello`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toMatchObject({'message': 'Hello, stranger!'})
        done()
      })
  })

  it('should return 200 & valid response if name param is set', done => {
    request(server)
      .get(`/api/v1/hello?name=Test%20Name`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toMatchObject({'message': 'Hello, Test Name!'})
        done()
      })
  })
  
  it('should return 400 & valid error response if name param is empty', done => {
    request(server)
      .get(`/api/v1/hello?name=`)
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toMatchObject({'error': {
          type: 'request_validation', 
          message: expect.stringMatching(/Empty.*\'name\'/), 
          errors: expect.anything()
        }})
        done()
      })
  })
})

describe('GET /goodbye', () => {
    it('should return 200 & valid response to authorization with fakeToken request', async () => {
      let done;
      const callbackResolved = new Promise((resolve) => { done = resolve; });

      const dummy = await createDummyAndAuthorize();
      request(server)
        .get(`/api/v1/goodbye`)
        .set('Authorization', `Bearer ${(dummy).token}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err)
          expect(res.body).toMatchObject({'message': `Goodbye, ${dummy.userId}!`})
          done()
        })
      
      await callbackResolved;
    })
  
    it('should return 401 & valid eror response to invalid authorization token', done => {
      request(server)
        .get(`/api/v1/goodbye`)
        .set('Authorization', 'Bearer invalidFakeToken')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err)
          expect(res.body).toMatchObject({error: {type: 'unauthorized', message: 'Authentication Failed'}})
          done()
        })
    })
  
    it('should return 401 & valid eror response if authorization header field is missed', done => {
      request(server)
        .get(`/api/v1/goodbye`)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err)
          expect(res.body).toMatchObject({'error': {
            type: 'request_validation', 
            message: 'Authorization header required', 
            errors: expect.anything()
          }})
          done()
        })
    })
  })