import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// ---------------------------------------------------------------------------
// Token Generation Helpers
// ---------------------------------------------------------------------------

export const generateAccessToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refreshSecret', {
    expiresIn: '7d',
  });
};

// ---------------------------------------------------------------------------
// Core Auth Business Logic
// ---------------------------------------------------------------------------

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface AuthResult {
  user: { _id: any; name: string; email: string; role: string };
  accessToken: string;
  refreshToken: string;
}

/**
 * Register a new patient user.
 * Password hashing is handled by the User model pre-save hook.
 */
export const registerUser = async (payload: RegisterPayload): Promise<AuthResult> => {
  const { name, email, password, phone } = payload;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw { status: 400, message: 'User already exists' };
  }

  // Password is auto-hashed via the User model pre-save hook
  const user = await User.create({ name, email, password, phone });

  const accessToken = generateAccessToken(user._id as unknown as string, user.role);
  const refreshToken = generateRefreshToken(user._id as unknown as string);

  return {
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

/**
 * Authenticate an existing user with email + password.
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const accessToken = generateAccessToken(user._id as unknown as string, user.role);
  const refreshToken = generateRefreshToken(user._id as unknown as string);

  return {
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

/**
 * Get current user profile (excludes password).
 */
export const getCurrentUser = async (userId: string): Promise<IUser | null> => {
  return User.findById(userId).select('-password');
};

/**
 * Verify a refresh token and issue a new access token.
 */
export const refreshAccessToken = async (
  token: string
): Promise<{ accessToken: string }> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refreshSecret', async (err: any, decoded: any) => {
      if (err) return reject({ status: 403, message: 'Invalid refresh token' });

      const user = await User.findById(decoded.id);
      if (!user) return reject({ status: 401, message: 'User not found' });

      const newAccessToken = generateAccessToken(user._id as unknown as string, user.role);
      resolve({ accessToken: newAccessToken });
    });
  });
};

/**
 * Update the user's password after verifying the current one.
 */
export const updatePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId);

  if (!user || !(await user.comparePassword(currentPassword))) {
    throw { status: 401, message: 'Invalid current password' };
  }

  // Setting password triggers the pre-save hash hook automatically
  user.password = newPassword;
  await user.save();
};
