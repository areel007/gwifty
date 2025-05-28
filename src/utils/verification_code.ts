export const generateVerificationCode = (): string => {
  // Generate a random 4-digit verification code
  return Math.floor(1000 + Math.random() * 9000).toString();
};

