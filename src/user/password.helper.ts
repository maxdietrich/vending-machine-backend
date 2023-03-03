import { hash, compare } from 'bcrypt';

const saltRounds = 10;

export const hashPassword = (rawPassword: string): Promise<string> => {
  return hash(rawPassword, saltRounds);
};

export const checkPassword = (
  encryptedUserPassword: string,
  enteredPassword: string,
) => {
  return compare(enteredPassword, encryptedUserPassword);
};
