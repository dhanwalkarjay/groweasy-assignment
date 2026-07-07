import { Router } from "express";
import { importCsv } from "../controllers/import.controller.js";
import { uploadCsv } from "../middleware/upload.js";

export const importRouter = Router();

importRouter.post("/", uploadCsv.single("file"), importCsv);
