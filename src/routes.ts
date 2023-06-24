import { Router } from "express";
import {
  AuthenticatedUser,
  Login,
  Logout,
  Register,
  UpdateInfo,
  UpdatePassword,
} from "./controller/auth.controller";
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
};
