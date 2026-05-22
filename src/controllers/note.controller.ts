import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { createNoteService, deleteNoteService, getAllNotesService, getSingleNoteService, updateNoteService } from "../service/notes.service.js";


export const createNote = async (
  req: AuthRequest,
  res: Response
) => {

  try {

    const { title, amount, content } = req.body;

    const userId = req.user?.userId as string;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const result = await createNoteService(
      title,
      amount,
      content,
      req.file,
      userId
    );

    return res.status(result.statusCode).json({
      message: result.message,
      success: result.success,
      note: result.note || null,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};


export const getAllNotes = async (
  req: AuthRequest,
  res: Response
) => {

  try {

    const userId = req.user?.userId as string;

    const result = await getAllNotesService(userId);

    return res.status(result.statusCode).json({
      success: result.success,
      notes: result.notes,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};


export const getSingleNote = async (
  req: AuthRequest<{ noteId: string }>,
  res: Response
) => {

  try {

    const { noteId } = req.params;

    const userId = req.user?.userId as string;

    const result = await getSingleNoteService(
      noteId,
      userId
    );

    return res.status(result.statusCode).json({
      message: result.message || null,
      success: result.success,
      note: result.note || null,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};


export const updateNote = async (
  req: AuthRequest<{ noteId: string }>,
  res: Response
) => {

  try {

    const { noteId } = req.params;

    const { title, amount, content } = req.body || {};

    const userId = req.user?.userId as string;

    const result = await updateNoteService(
      noteId,
      title,
      amount,
      content,
      req.file,
      userId
    );

    return res.status(result.statusCode).json({
      message: result.message,
      success: result.success,
      note: result.note || null,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};


export const deleteNote = async (
  req: AuthRequest<{ noteId: string }>,
  res: Response
) => {

  try {

    const { noteId } = req.params;

    const userId = req.user?.userId as string;

    const result = await deleteNoteService(
      noteId,
      userId
    );

    return res.status(result.statusCode).json({
      message: result.message,
      success: result.success,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};

