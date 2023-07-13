import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { getRepository } from "typeorm";
import { User } from "../entity/user.entity";

export const AuthMiddleware = async (
  req: Request,
  res: Response,
  next: Function
) => {
  try {
    const jwt = req.cookies["jwt"];

    const payload: any = verify(jwt, process.env.SECRET_KEY);

    if (!payload) {
      return res.status(401).send({
        message: "Unauthenticated!",
      });
    }

    // If it is 0 user is in ambasador route otherwise it's in admin route
    const is_ambassador = req.path.indexOf("api/ambassador") >= 0;

    const user = await getRepository(User).findOneBy({
      id: payload.id,
    });

    // Use scope to verify if user goes to the right path
    if (
      (is_ambassador && payload.scope !== "ambassador") ||
      (!is_ambassador && payload.scope !== "admin")
    ) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }

    req["user"] = user;

    next();
  } catch (error) {
    return res.status(401).send({
      message: "Unauthenticated!",
    });
  }
};
