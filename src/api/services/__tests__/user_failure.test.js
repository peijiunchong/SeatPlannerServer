var jwt = require('jsonwebtoken');

import db from '../../../utils/db'
import { createDummy } from '../../../test/user'
import user from '../user'

beforeAll(async () => {
  await db.open()
})

afterAll(async () => {
  await db.close()
})

describe('login', () => {
  it('should return internal_server_error if jwt.sign fails with the error', async () => {
    (jwt.sign) = (
        payload,
        secretOrPrivateKey,
        options,
        callback
    ) => {
        callback(new Error('failure'), undefined)
    }

    const dummy = await createDummy()
    await expect(user.login(dummy.email, dummy.password)).rejects.toEqual({
      error: {type: 'internal_server_error', message: 'Internal Server Error'}
    })
  })
})