import { AppError } from "../../errors/AppError";
import prismaClient from "../../prisma/index";

interface DeleteProductProps {
  product_id: string;
}

class DeleteProductService {
  async execute({ product_id }: DeleteProductProps) {
    const productExists = await prismaClient.product.findFirst({
      where: {
        id: product_id,
      },
    });

    if (!productExists) {
      throw new AppError("Produto não encontrado", 404);
    }

    await prismaClient.product.delete({
      where: {
        id: product_id,
      },
    });

    return { message: "Produto deletado com sucesso" };
  }
}

export { DeleteProductService };
