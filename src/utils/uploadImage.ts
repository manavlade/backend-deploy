import imagekit from "../config/imagekit.js";

import { toFile } from "@imagekit/nodejs";


export const uploadImage = async (
  file: Express.Multer.File
) => {

  try {

    const uploadableFile = await toFile(
      file.buffer,
      file.originalname
    );

    const response = await imagekit.files.upload({
      file: uploadableFile,

      fileName: `${Date.now()}-${file.originalname}`,

      folder: "/notes-app",
    });

    return {
      success: true,
      url: response.url,
      fileId: response.fileId,
    };

  } catch (error) {

    console.log(error);

    return {
      success: false,
      message: "Image upload failed",
    };
  }
};