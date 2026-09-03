import { Router } from "express";
import multer from "multer";
import uploadConfig from "./config/multer";
import { authLimiter } from "./config/rateLimit";
import { CreateUserController } from "./controllers/user/CreateUserController";
import { validateSchema } from "./middlewares/validateSchema";
import { authUserSchema, createUserSchema } from "./schemas/userSchema";
import { AuthUserController } from "./controllers/user/AuthUserController";
import { DetailUserController } from "./controllers/user/DetailUserController";
import { LogoutController } from "./controllers/user/LogoutController";
import { isAuthenticated } from "./middlewares/isAuthenticated";
import { CreateCategoryController } from "./controllers/category/CreateCategoryController";
import { ListCategoryController } from "./controllers/category/ListCategoryController";
import { DeleteCategoryController } from "./controllers/category/DeleteCategoryController";
import { MoveCategoryProductsController } from "./controllers/category/MoveCategoryProductsController";
import { isAdmin } from "./middlewares/isAdmin";
import { auditLog } from "./middlewares/auditLog";
import {
  createCategorySchema,
  deleteCategorySchema,
  moveCategoryProductsSchema,
} from "./schemas/categorySchema";
import { CreateProductController } from "./controllers/products/CreateProductController";
import { ListProductController } from "./controllers/products/ListProductController";
import {
  createProductSchema,
  listProductSchema,
  archiveProductSchema,
  deleteProductSchema,
  listProductByCategorySchema,
} from "./schemas/productSchema";
import { ArchiveProductController } from "./controllers/products/ArchiveProductController";
import { DeleteProductController } from "./controllers/products/DeleteProductController";
import { ListProductByCategoryController } from "./controllers/products/ListProductByCategoryController";
import { CreateOrderController } from "./controllers/order/CreateOrderController";
import {
  addItemOrderSchema,
  createOrderSchema,
  deleteOrderSchema,
  detailOrderSchema,
  finishOrderSchema,
  listOrderSchema,
  removeItemOrderSchema,
  sendOrderSchema,
} from "./schemas/orderSchema";
import { ListOrderController } from "./controllers/order/ListOrderController";
import { AddItemOrderController } from "./controllers/order/AddItemOrderController";
import { RemoveItemOrderController } from "./controllers/order/RemoveItemOrderController";
import { DetailOrderController } from "./controllers/order/DetailOrderController";
import { SendOrderController } from "./controllers/order/SendOrderController";
import { FinishOrderController } from "./controllers/order/FinishOrderController";
import { DeleteOrderController } from "./controllers/order/DeleteOrderController";

const router = Router();
const upload = multer(uploadConfig);

// User routes
// Criação de usuários é restrita a ADMIN (o gerente provisiona as contas dos
// atendentes). O primeiro ADMIN é criado pelo seed (prisma/seed.ts).
router.post(
  "/users",
  isAuthenticated,
  isAdmin,
  auditLog,
  validateSchema(createUserSchema),
  new CreateUserController().handle,
);
router.post(
  "/session",
  authLimiter,
  validateSchema(authUserSchema),
  new AuthUserController().handle,
);
router.get("/me", isAuthenticated, new DetailUserController().handle);
router.post("/logout", isAuthenticated, new LogoutController().handle);

// Category routes
router.post(
  "/category",
  isAuthenticated,
  isAdmin,
  auditLog,
  validateSchema(createCategorySchema),
  new CreateCategoryController().handle,
);
router.get(
  "/category-list",
  isAuthenticated,
  new ListCategoryController().handle,
);
router.delete(
  "/category",
  isAuthenticated,
  isAdmin,
  auditLog,
  validateSchema(deleteCategorySchema),
  new DeleteCategoryController().handle,
);
router.patch(
  "/category/products",
  isAuthenticated,
  isAdmin,
  auditLog,
  validateSchema(moveCategoryProductsSchema),
  new MoveCategoryProductsController().handle,
);

// Product routes
router.post(
  "/product",
  isAuthenticated,
  isAdmin,
  auditLog,
  upload.single("file"),
  validateSchema(createProductSchema),
  new CreateProductController().handle,
);
router.get(
  "/products",
  isAuthenticated,
  validateSchema(listProductSchema),
  new ListProductController().handle,
);
router.patch(
  "/product",
  isAuthenticated,
  isAdmin,
  auditLog,
  validateSchema(archiveProductSchema),
  new ArchiveProductController().handle,
);
router.delete(
  "/product",
  isAuthenticated,
  isAdmin,
  auditLog,
  validateSchema(deleteProductSchema),
  new DeleteProductController().handle,
);
router.get(
  "/category/product",
  isAuthenticated,
  validateSchema(listProductByCategorySchema),
  new ListProductByCategoryController().handle,
);

// Order routes
router.post(
  "/order",
  isAuthenticated,
  validateSchema(createOrderSchema),
  new CreateOrderController().handle,
);

router.get(
  "/orders",
  isAuthenticated,
  validateSchema(listOrderSchema),
  new ListOrderController().handle,
);

router.post(
  "/order/add",
  isAuthenticated,
  validateSchema(addItemOrderSchema),
  new AddItemOrderController().handle,
);

router.delete(
  "/order/remove",
  isAuthenticated,
  validateSchema(removeItemOrderSchema),
  new RemoveItemOrderController().handle,
);

router.get(
  "/order/detail",
  isAuthenticated,
  validateSchema(detailOrderSchema),
  new DetailOrderController().handle,
);

router.put(
  "/order/send",
  isAuthenticated,
  auditLog,
  validateSchema(sendOrderSchema),
  new SendOrderController().handle,
);

router.put(
  "/order/finish",
  isAuthenticated,
  auditLog,
  validateSchema(finishOrderSchema),
  new FinishOrderController().handle,
);

router.delete(
  "/order/delete",
  isAuthenticated,
  auditLog,
  validateSchema(deleteOrderSchema),
  new DeleteOrderController().handle,
);
export { router };
