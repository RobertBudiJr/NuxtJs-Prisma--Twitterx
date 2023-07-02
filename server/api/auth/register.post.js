import { sendError } from 'h3';
import { createUser } from '../../db/users';
import { userTransformer } from '../../transformers/users';

export default defineEventHandler(async (event) => {
  // Read Endpoint
  const body = await readBody(event);

  // Extract every single properties value from body
  const { username, email, password, repeatPassword, name } = body;

  // If one of requirement invalid, will send error message
  !username || !email || !password || !repeatPassword || !name ? sendError(event, createError({ statusCode: 400, statusMessage: 'Invalid Params' })) : { statusMessage: 'Data valid' };

  // If password and repeat password do not match, will print error
  password !== repeatPassword ? sendError(event, createError({ statusCode: 400, statusMessage: 'Password do not match' })) : { statusMessage: 'Password verification match' };

  // Define passed value
  const userData = {
    username,
    email,
    password,
    name,
    profileImage: 'assets/img/Profile.png',
  };

  const user = await createUser(userData);

  // Return will return currently created user
  return {
    body: userTransformer(user),
  };
});
