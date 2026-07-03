import multer from "multer";

// Configuração do multer para armazenamento de arquivos em memória
export default multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de tamanho do arquivo (5MB)
  },
  fileFilter: (
    req,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    // Verifica se o arquivo é uma imagem
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos de imagem são permitidos."));
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos JPEG, PNG e JPG são permitidos."));
    }
  },
});
