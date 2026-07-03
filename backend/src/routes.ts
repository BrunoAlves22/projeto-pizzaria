import { Router, Request, Response } from "express";
import { CreateUserController } from "./controllers/user/CreateUserController";
import { validateSchema } from "./middlewares/validateSchema";
import { authUserSchema, createUserSchema } from "./schemas/userSchema";
import { AuthUserController } from "./controllers/user/AuthUserController";
import { DetailUserController } from "./controllers/user/DetailUserController";
import { isAuthenticated } from "./middlewares/isAuthenticated";
import { CreateCategoryController } from "./controllers/category/CreateCategoryController";
import { ListCategoryController } from "./controllers/category/ListCategoryController";
import { isAdmin } from "./middlewares/isAdmin";
import { createCategorySchema } from "./schemas/categorySchema";
import { CreateProductController } from "./controllers/products/CreateProductController";

const router = Router();

// User routes
router.post(
  "/users",
  validateSchema(createUserSchema),
  new CreateUserController().handle,
);
router.post(
  "/session",
  validateSchema(authUserSchema),
  new AuthUserController().handle,
);
router.get("/me", isAuthenticated, new DetailUserController().handle);

// Category routes
router.post(
  "/category",
  isAuthenticated,
  isAdmin,
  validateSchema(createCategorySchema),
  new CreateCategoryController().handle,
);
router.get(
  "/category-list",
  isAuthenticated,
  new ListCategoryController().handle,
);

// Product routes
router.post(
  "/product",
  isAuthenticated,
  isAdmin,
  new CreateProductController().handle,
);
export { router };
