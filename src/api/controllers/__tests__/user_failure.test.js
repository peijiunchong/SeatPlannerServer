import request from 'supertest'
import UserService from '../../../api/services/user.js'
import { createServer } from '../../../utils/server.js'
import faker from 'faker'

jest.mock('../../../api/services/user')

beforeAll(async () => {
  server = await createServer()
})

describe('auth failure', () => {
  it('should return 500 & valid response if auth rejects with an error', done => {
    (UserService.auth).mockRejectedValue(new Error())
    request(server)
      .get(`/api/v1/goodbye`)
      .set('Authorization', 'Bearer fakeToken')
      .expect(500)
      .end(function(err, res) {
        if (err) return done(err)
        expect(res.body).toMatchObject({error: {type: 'internal_server_error', message: 'Internal Server Error'}})
        done()
      })
  })
})

describe('createUser failure', () => {
  it('should return 500 & valid response if auth rejects with an error', done => {
    (UserService.createUser).mockResolvedValue({error: {type: 'unkonwn'}})
    request(server)
      .post(`/api/v1/user`)
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.name.firstName()
      })
      .expect(500)
      .end(function(err, res) {
        if (err) return done(err)
        expect(res.body).toMatchObject({error: {type: 'internal_server_error', message: 'Internal Server Error'}})
        done()
      })
  })
})

describe('login failure', () => {
  it('should return 500 & valid response if auth rejects with an error', done => {
    (UserService.login).mockResolvedValue({error: {type: 'unkonwn'}})
    request(server)
      .post(`/api/v1/login`)
      .send({
        email: faker.internet.email(),
        password: faker.internet.password()
      })
      .expect(500)
      .end(function(err, res) {
        if (err) return done(err)
        expect(res.body).toMatchObject({error: {type: 'internal_server_error', message: 'Internal Server Error'}})
        done()
      })
  })
})