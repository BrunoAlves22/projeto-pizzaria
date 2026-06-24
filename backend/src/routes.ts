import { Router, Request, Response } from "express";
import { CreateUserController } from "./controllers/user/CreateUserController";
import { validateSchema } from "./middlewares/validateSchema";
import { authUserSchema, createUserSchema } from "./schemas/userSchema";
import { AuthUserController } from "./controllers/user/AuthUserController";
import { DetailUserController } from "./controllers/user/DetailUserController";
import { isAuthenticated } from "./middlewares/isAuthenticated";
import { CreateCategoryController } from "./controllers/category/CreateCategoryController";

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
  new CreateCategoryController().handle,
);

export { router };
