import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma";

interface ServiceResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  user?: T | null;
  token?: string;
}

export const registerService = async (
  name: string,
  email: string,
  password: string
): Promise<ServiceResponse> => {
  try {
    if (!name || !email || !password) {
      return {
        success: false,
        statusCode: 400,
        message: "Insufficient Data",
        user: null,
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        statusCode: 409,
        message: "User already exists",
        user: null,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      statusCode: 201,
      message: "User registered successfully",
      user,
    };
  } catch (error) {
    console.log("registerService error:", error);

    return {
      success: false,
      statusCode: 500,
      message: "Internal Server Error",
      user: null,
    };
  }
};

export const loginService = async (
  email: string,
  password: string
): Promise<ServiceResponse> => {
  try {
    if (!email || !password) {
      return {
        success: false,
        statusCode: 400,
        message: "All fields are required",
      };
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        statusCode: 401,
        message: "Invalid credentials",
      };
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return {
        success: false,
        statusCode: 401,
        message: "Invalid credentials",
      };
    }

    const token = jwt.sign(
      {
        userId: user.id,
        name: user.name,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    return {
      success: true,
      statusCode: 200,
      message: `Welcome back ${user.name}`,
      token,
      user: sanitizedUser,
    };
  } catch (error) {
    console.log("loginService error:", error);

    return {
      success: false,
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
};

export const getUserByIdService = async (
  userId: string
): Promise<ServiceResponse> => {
  try {
    if (!userId) {
      return {
        success: false,
        statusCode: 400,
        message: "User ID is required",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return {
        success: false,
        statusCode: 404,
        message: "User not found",
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: "User fetched successfully",
      user,
    };
  } catch (error) {
    console.log("getUserByIdService error:", error);

    return {
      success: false,
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
};

export const getLoggedInUserService = async (
  userId: string
): Promise<ServiceResponse> => {
  try {
    if (!userId) {
      return {
        success: false,
        statusCode: 400,
        message: "User ID is required",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return {
        success: false,
        statusCode: 404,
        message: "User not found",
        user: null,
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: "User fetched successfully",
      user,
    };
  } catch (error) {
    console.log("getLoggedInUserService error:", error);

    return {
      success: false,
      statusCode: 500,
      message: "Internal Server Error",
      user: null,
    };
  }
};