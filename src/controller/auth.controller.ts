import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entity/user.entity";
import bcrypt from "bcryptjs";
import { sign, verify } from "jsonwebtoken";

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
      is_ambassador: false,
    });

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
      select: { id: true, password: true },
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

    const token = sign(
      {
        id: user.id,
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
  res.send(req["user"]);
};

export const Logout = async (req: Request, res: Response) => {
  res.cookie("jwt", "", { maxAge: 0 });

  res.send({ message: "success" });
};
