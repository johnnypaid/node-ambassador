import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Link } from "../entity/link.entity";

export const Links = async (req: Request, res: Response) => {
  const links = await getRepository(Link).find({
    where: {
      user: req.params,
    },
    relations: ["orders", "orders.order_items"],
  });

  res.send(links);
};
