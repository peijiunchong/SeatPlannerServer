import faker from 'faker'

import User from '../api/models/user';
import UserService from '../api/services/user';

// type DummyUser = {email: string, password: string, name: string, userId: string}
// type AuthorizedDummyUser = {email: string, password: string, name: string, userId: string, token: string}

export function dummy() {
    return {
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.name.findName(),
    }
}

export async function createDummy() {
    const user = dummy();
    const dbuser = new User(user);
    await dbuser.save();
    return {...user, userId: dbuser._id.toString()}
}

export async function createDummyAndAuthorize() {
    const user = await createDummy();
    const authToken = await UserService.createAuthToken(user.userId)
    return {...user, token: authToken.token}
}