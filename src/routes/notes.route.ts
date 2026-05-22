import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { createNote, deleteNote, getAllNotes, getSingleNote, updateNote } from "../controllers/note.controller.js";
import upload from "../middleware/note.middleware.js";

const router = Router();

router.post("/", isAuthenticated, upload.single("image"), createNote);

router.get("/", isAuthenticated, getAllNotes);

router.get("/:noteId", isAuthenticated, getSingleNote);

router.put("/:noteId", isAuthenticated, upload.single("image"), updateNote);

router.delete("/:noteId", isAuthenticated, deleteNote);

export default router;