import { Router } from "express";
import {
  AuthenticatedUser,
  Login,
  Logout,
  Register,
  UpdateInfo,
  UpdatePassword,
} from "./controller/auth.controller";
import { CreateLink, Links, Stats } from "./controller/link.controller";
import {
  ConfirmOrder,
  CreateOrder,
  Orders,
} from "./controller/order.controller";
import {
  CreateProducts,
  DeleteProduct,
  GetProduct,
  Products,
  ProductsBackend,
  ProductsFrontend,
  UpdateProduct,
} from "./controller/product.controller";
import { Ambassadors, GetLink, Rankings } from "./controller/user.controller";
import { AuthMiddleware } from "./middleware/auth.middleware";

export const routes = (router: Router) => {
  // Admin
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

  // Ambassador
  router.post("/api/ambassador/register", Register);
  router.post("/api/ambassador/login", Login);
  router.get("/api/ambassador/user", AuthMiddleware, AuthenticatedUser);
  router.post("/api/ambassador/logout", AuthMiddleware, Logout);
  router.post("/api/ambassador/users/info", AuthMiddleware, UpdateInfo);
  router.post("/api/ambassador/users/password", AuthMiddleware, UpdatePassword);
  router.get("/api/ambassador/products/frontend", ProductsFrontend);
  router.get("/api/ambassador/products/backend", ProductsBackend);
  router.post("/api/ambassador/links", AuthMiddleware, CreateLink);
  router.get("/api/ambassador/stats", AuthMiddleware, Stats);
  router.get("/api/ambassador/rankings", AuthMiddleware, Rankings);

  // Checkout
  router.get("/api/checkout/links/:code", GetLink);
  router.post("/api/checkout/orders", CreateOrder);
  router.post("/api/checkout/orders/confirm", ConfirmOrder);
};
