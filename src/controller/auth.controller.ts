import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entity/user.entity";
import bcrypt from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { Order } from "../entity/order.entity";

export const Register = async (req: Request, res: Response) => {
  try {
    const { password, password_confirm, ...body } = req.body;

    if (password !== password_confirm) {
      return res.status(400).send({
        message: "Password's did not match!",
      });
    }

    if (await getRepository(User).findOneBy({ email: body.email })) {
      return res.status(400).send({
        message: "Email already exist",
      });
    }

    const user = await getRepository(User).save({
      ...body,
      password: await bcrypt.hash(password, 10),
      is_ambassador: req.path === "/api/ambassador/register",
    });

    delete user.password;

    res.send(user);
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong!",
    });
  }
};

export const Login = async (req: Request, res: Response) => {
  try {
    const user = await getRepository(User).findOne({
      select: { id: true, password: true, is_ambassador: true },
      where: { email: req.body.email },
    });

    if (!user) {
      return res.status(400).send({
        message: "Invalid credentials!",
      });
    }

    if (!(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(400).send({
        message: "Invalid credentials!",
      });
    }

    const adminLogin = req.path === "/api/admin/login";

    // If user is ambassador and trying to login to admin path
    if (user.is_ambassador && adminLogin) {
      return res.status(401).send({
        message: "Unauthorized",
      });
    }

    const token = sign(
      {
        id: user.id,
        scope: adminLogin ? "admin" : "ambassador",
      },
      process.env.SECRET_KEY
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.send({
      message: "success",
    });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong!",
    });
  }
};

export const AuthenticatedUser = async (req: Request, res: Response) => {
  const user = req["user"];

  // If admin just return the user
  if (req.path === "/api/admin/user") {
    res.send(user);
  }

  // If ambassador get the orders
  const orders = await getRepository(Order).find({
    where: { user_id: user.id, complete: true },
    relations: ["order_items"],
  });

  user.revenue = orders.reduce((s, o) => s + o.ambassadorTotal, 0);

  res.send(user);
};

export const Logout = async (req: Request, res: Response) => {
  res.cookie("jwt", "", { maxAge: 0 });

  res.send({ message: "success" });
};

export const UpdateInfo = async (req: Request, res: Response) => {
  try {
    const user = req["user"]; // authenticated user from the middleware req["user"]
    const repository = getRepository(User);

    await repository.update(user.id, req.body);

    res.send(await repository.findOneBy({ id: user.id }));
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong!",
    });
  }
};

export const UpdatePassword = async (req: Request, res: Response) => {
  try {
    const user = req["user"]; // authenticated user from the middleware req["user"]

    if (req.body.password !== req.body.password_confirm) {
      return res.status(400).send({
        message: "Password's did not match!",
      });
    }

    const userInfo = getRepository(User);
    const userInfoToUpdate = await userInfo.findOneBy({ id: user.id });

    userInfoToUpdate.password = await bcrypt.hash(req.body.password, 10);

    await userInfo.save(userInfoToUpdate);

    res.send(user);
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong!",
    });
  }
};
