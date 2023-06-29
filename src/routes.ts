import { Router } from "express";
import {
  AuthenticatedUser,
  Login,
  Logout,
  Register,
  UpdateInfo,
  UpdatePassword,
} from "./controller/auth.controller";
import { Links } from "./controller/link.controller";
import { Orders } from "./controller/order.controller";
import {
  CreateProducts,
  DeleteProduct,
  GetProduct,
  Products,
  UpdateProduct,
} from "./controller/product.controller";
import { Ambassadors } from "./controller/user.controller";
import { AuthMiddleware } from "./middleware/auth.middleware";

export const routes = (router: Router) => {
  router.post("/api/admin/register", Register);
  router.post("/api/admin/login", Login);
  router.get("/api/admin/user", AuthMiddleware, AuthenticatedUser);
  router.post("/api/admin/logout", AuthMiddleware, Logout);
  router.post("/api/admin/users/info", AuthMiddleware, UpdateInfo);
  router.post("/api/admin/users/password", AuthMiddleware, UpdatePassword);
  router.get("/api/admin/ambassadors", AuthMiddleware, Ambassadors);
  router.get("/api/admin/products", AuthMiddleware, Products);
  router.post("/api/admin/products/", AuthMiddleware, CreateProducts);
  router.get("/api/admin/products/:id", AuthMiddleware, GetProduct);
  router.put("/api/admin/products/:id", AuthMiddleware, UpdateProduct);
  router.delete("/api/admin/products/:id", AuthMiddleware, DeleteProduct);
  router.get("/api/admin/users/:id/links", AuthMiddleware, Links);
  router.get("/api/admin/orders", AuthMiddleware, Orders);
};
