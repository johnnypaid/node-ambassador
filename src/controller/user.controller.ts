import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entity/user.entity";

export const Ambassadors = async (req: Request, res: Response) => {
  res.send(await getRepository(User).find({ where: { is_ambassador: true } }));
};
