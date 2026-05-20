import { Router } from "express";
import { getUserById, loginUser, logoutUser, registerController, getLoggedInUser } from "../controllers/auth.controller.js"
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerController);

router.post("/login", loginUser);

router.get("/logout", logoutUser);

router.get("/:userId", getUserById);

router.get("/me", isAuthenticated, getLoggedInUser)

export default router;