import { prisma } from "../config/prisma.js";

import { uploadImage } from "../utils/uploadImage.js";

import client from "../config/imagekit.js";
import Decimal from "decimal.js";

export const createNoteService = async (
    title: string,
    amount: number,
    content: string | undefined,
    file: Express.Multer.File,
    userId: string
) => {

    if (!title?.trim()) {
        return {
            success: false,
            statusCode: 400,
            message: "Title is required",
        };
    }

    if (amount === undefined || amount === null) {
        return {
            success: false,
            statusCode: 400,
            message: "Amount is required",
        };
    }

    if (!file) {
        return {
            success: false,
            statusCode: 400,
            message: "Image is required",
        };
    }

    if (title.length < 3 || title.length > 100) {
        return {
            success: false,
            statusCode: 400,
            message: "Title must be between 3 and 100 characters",
        };
    }

    if (content && (content.length < 5 || content.length > 1000)) {
        return {
            success: false,
            statusCode: 400,
            message: "Content must be between 5 and 1000 characters",
        };
    }

    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
        return {
            success: false,
            statusCode: 400,
            message: "Only jpeg, jpg, png and webp allowed",
        };
    }

    const uploadedImage = await uploadImage(file);

    if (!uploadedImage.success) {
        return {
            success: false,
            statusCode: 500,
            message: "Image upload failed",
        };
    }

    const note = await prisma.note.create({
        data: {
            title: title.trim(),
            amount: new Decimal(amount),
            content: content?.trim(),
            imageUrl: uploadedImage.url as string,
            imageFieldId: uploadedImage.fileId as string,
            userId,
        },
    });

    return {
        success: true,
        statusCode: 201,
        message: "Note created successfully",
        note,
    };
};

export const getAllNotesService = async (
    userId: string
) => {

    const notes = await prisma.note.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return {
        success: true,
        statusCode: 200,
        notes,
    };
};


export const getSingleNoteService = async (
    noteId: string,
    userId: string
) => {

    if (!noteId) {
        return {
            success: false,
            statusCode: 400,
            message: "Note ID is required",
        };
    }

    const note = await prisma.note.findFirst({
        where: {
            id: noteId,
            userId,
        },
    });

    if (!note) {
        return {
            success: false,
            statusCode: 404,
            message: "Note not found",
        };
    }

    return {
        success: true,
        statusCode: 200,
        note,
    };
};

export const updateNoteService = async (
    noteId: string,
    title: string | undefined,
    amount: number | undefined,
    content: string | undefined,
    file: Express.Multer.File | undefined,
    userId: string
) => {

    if (!noteId) {
        return {
            success: false,
            statusCode: 400,
            message: "Note ID is required",
        };
    }

    const existingNote = await prisma.note.findFirst({
        where: {
            id: noteId,
            userId,
        },
    });

    if (!existingNote) {
        return {
            success: false,
            statusCode: 404,
            message: "Note not found",
        };
    }

    const updateData: any = {};

    if (title !== undefined) {

        if (title.length < 3 || title.length > 100) {
            return {
                success: false,
                statusCode: 400,
                message: "Title must be between 3 and 100 characters",
            };
        }

        updateData.title = title.trim();
    }

    if (amount !== undefined) {

        if (amount < 0) {
            return {
                success: false,
                statusCode: 400,
                message: "Amount cannot be negative",
            };
        }

        updateData.amount = new Decimal(amount);
    }

    if (content !== undefined) {

        if (content.length < 5 || content.length > 1000) {
            return {
                success: false,
                statusCode: 400,
                message: "Content must be between 5 and 1000 characters",
            };
        }

        updateData.content = content.trim();
    }

    if (file) {

        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp",
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return {
                success: false,
                statusCode: 400,
                message: "Only image files are allowed",
            };
        }

        try {

            if (existingNote.imageFieldId) {

                await client.files.delete(
                    existingNote.imageFieldId
                );
            }

        } catch (error) {

            console.log(
                "Failed to delete old image",
                error
            );
        }

        const uploadedImage = await uploadImage(file);

        if (!uploadedImage.success) {
            return {
                success: false,
                statusCode: 500,
                message: "Image upload failed",
            };
        }

        updateData.imageUrl = uploadedImage.url;
        updateData.imageFieldId = uploadedImage.fileId;
    }

    const updatedNote = await prisma.note.update({
        where: {
            id: noteId,
        },

        data: updateData,
    });

    return {
        success: true,
        statusCode: 200,
        message: "Note updated successfully",
        note: updatedNote,
    };
};


export const deleteNoteService = async (
    noteId: string,
    userId: string
) => {

    if (!noteId) {
        return {
            success: false,
            statusCode: 400,
            message: "Note ID is required",
        };
    }

    const existingNote = await prisma.note.findFirst({
        where: {
            id: noteId,
            userId,
        },
    });

    if (!existingNote) {
        return {
            success: false,
            statusCode: 404,
            message: "Note not found",
        };
    }

    if (existingNote.imageFieldId) {
        try {
            await client.files.delete(existingNote.imageFieldId);
        } catch (error) {
            console.log("Failed to delete image from ImageKit", error);
        }
    }

    await prisma.note.delete({
        where: {
            id: noteId,
        },
    });

    return {
        success: true,
        statusCode: 200,
        message: "Note deleted successfully",
    };
};
