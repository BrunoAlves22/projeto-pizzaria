import { AppError } from "../../errors/AppError";
import prismaClient from "../../prisma/index";

interface ArchiveProductProps {
  product_id: string;
}

class ArchiveProductService {
  async execute({ product_id }: ArchiveProductProps) {
    const productExists = await prismaClient.product.findFirst({
      where: {
        id: product_id,
      },
    });

    if (!productExists) {
      throw new AppError("Produto não encontrado", 404);
    }

    await prismaClient.product.update({
      where: {
        id: product_id,
      },
      data: {
        disabled: true,
      },
    });

    return { message: "Produto arquivado com sucesso" };
  }
}

export { ArchiveProductService };
