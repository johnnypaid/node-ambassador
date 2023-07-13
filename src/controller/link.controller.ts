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

export const CreateLink = async (req: Request, res: Response) => {
  const user = req["user"]; // user data is from auth middleware

  const link = await getRepository(Link).save({
    user,
    code: Math.random().toString(36).substr(6),
    product: req.body.products.map((id) => ({ id })),
  });

  res.send(link);
};

// endpoint for checking ambassador's revenue in every link created
export const Stats = async (req: Request, res: Response) => {
  // get the links from the authenticated ambassador
  const user = req["user"];

  const links = await getRepository(Link).find({
    where: { user },
    relations: ["orders", "orders.order_items"],
  });

  res.send(links.map( link => {
    const orders = link.orders.filter(o => o.complete);

    return {
      code: link.code,
      count: orders.length, // users that bought this link
      revenue: orders.reduce((s, o) => s + o.ambassadorTotal, 0)
    }
  }))
};
