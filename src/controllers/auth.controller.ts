import { Request, Response } from "express";
import { getLoggedInUserService, getUserByIdService, loginService, registerService } from "../service/auth.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const registerController = async (
    req: Request,
    res: Response
) => {
    try {

        const { name, email, password } = req.body;

        const result = await registerService(
            name,
            email,
            password
        );

        if (!result.success) {
            return res.status(result.statusCode).json({
                message: result.message,
                success: false,
            });
        }

        return res
            .status(result.statusCode)
            .json({
                message: result.message,
                success: true,
                user: result.user,
            });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Server Error",
            success: false,
        });

    }
}

export const loginUser = async (
    req: Request,
    res: Response
) => {

    try {

        const { email, password } = req.body;

        const result = await loginService(
            email,
            password
        );

        if (!result.success) {
            return res.status(result.statusCode).json({
                message: result.message,
                success: false,
            });
        }

        return res
            .status(result.statusCode)
            .cookie("token", result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 1 * 24 * 60 * 60 * 1000,
            })
            .json({
                message: result.message,
                success: true,
                user: result.user,
            });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Server Error",
            success: false,
        });
    }
};

export const logoutUser = async (
    req: Request,
    res: Response
) => {

    try {

        return res
            .status(200)
            .cookie("token", "", {
                maxAge: 0,
            })
            .json({
                message: "Logged out successfully",
                success: true,
            });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Server Error",
            success: false,
        });
    }
};


export const getUserById = async (
    req: Request<{ userId: string }>,
    res: Response
) => {

    try {

        const { userId } = req.params;

        const result = await getUserByIdService(userId);

        return res.status(result.statusCode).json({
            message: result.message,
            success: result.success,
            user: result.user || null,
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Server Error",
            success: false,
        });
    }
};


export const getLoggedInUser = async (
    req: AuthRequest,
    res: Response
) => {
    try {

        console.log("🔥 CONTROLLER HIT");
        console.log("USER ID:", req.user?.userId);
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const result = await getLoggedInUserService(userId);

        return res.status(result.statusCode).json({
            success: result.success,
            message: result.message,
            user: result.user
        });

    } catch (error) {
        console.log("getLoggedInUser controller error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};