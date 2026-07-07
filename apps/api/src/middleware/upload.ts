import multer from "multer";

export const uploadCsv = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isCsv =
      file.originalname.toLowerCase().endsWith(".csv") ||
      ["text/csv", "application/vnd.ms-excel"].includes(file.mimetype);

    if (!isCsv) {
      cb(new Error("Only .csv files are allowed"));
      return;
    }

    cb(null, true);
  }
});
