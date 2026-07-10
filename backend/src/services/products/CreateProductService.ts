import prismaClient from "../../prisma/index";
import cloudinary from "../../config/cloudinary";
import { Readable } from "stream";
import { UploadApiResponse } from "cloudinary";
import { AppError } from "../../errors/AppError";

interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageBuffer: Buffer;
  imageName: string;
}

class CreateProductService {
  async execute({
    name,
    description,
    price,
    categoryId,
    imageBuffer,
    imageName,
  }: CreateProductDTO) {
    const categoryExists = await prismaClient.category.findFirst({
      where: {
        id: categoryId,
      },
    });

    if (!categoryExists) {
      throw new AppError("Categoria não encontrada", 404);
    }

    let bannerUrl = "";

    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "pizzaria",
            resource_type: "image",
            public_id: `${Date.now()}-${imageName.split(".")[0]}`,
          },
          (error, result) => {
            if (error || !result) {
              reject(error ?? new Error("Upload sem retorno do Cloudinary"));
            } else {
              resolve(result);
            }
          },
        );
        const bufferStream = Readable.from(imageBuffer);
        bufferStream.pipe(uploadStream);
      });

      bannerUrl = result.secure_url;
    } catch (error) {
      throw new AppError("Erro ao fazer upload da imagem para o Cloudinary", 502);
    }

    const product = await prismaClient.product.create({
      data: {
        name,
        description,
        price,
        categoryId,
        banner: bannerUrl,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        banner: true,
        categoryId: true,
        createdAt: true,
      },
    });

    return product;
  }
}

export { CreateProductService };
