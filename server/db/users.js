import { prisma } from '.';
import bcrypt from 'bcrypt';

// Make Create User
export const createUser = (userData) => {
  // Overwrite and encrypt password
  const finalUserData = {
    // Spread passed data
    ...userData,
    // Encrypt password
    password: bcrypt.hashSync(userData.password, 10),
  };

  return prisma.user.create({
    data: finalUserData,
  });
};
