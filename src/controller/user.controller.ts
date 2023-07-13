import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { client } from "../app";
import { Link } from "../entity/link.entity";
import { User } from "../entity/user.entity";

export const Ambassadors = async (req: Request, res: Response) => {
  res.send(await getRepository(User).find({ where: { is_ambassador: true } }));
};

export const Rankings = async (req: Request, res: Response) => {
  // use redis to get rankings faster by executing rankings.seeder.ts
  // execute rankings.seeder.ts in the package.json srcipt
  // const result = client.zRange("rankings", 0, -1);
  const result: string[] = await client.sendCommand([
    "ZREVRANGEBYSCORE",
    "rankings",
    "+inf",
    "-inf",
    "WITHSCORES",
  ]);

  let name = "";

  res.send(
    // use  reduce function to manipulate object
    result.reduce((accumolator, value) => {
      if (isNaN(parseInt(value))) {
        name = value;

        return accumolator;
      } else {
        return {
          ...accumolator,
          [name]: parseInt(value),
        };
      }
    }, {})
  );
};

export const GetLink = async (req: Request, res: Response) => {
  res.send(
    await getRepository(Link).findOne({
      where: { code: req.params.code },
      relations: ["user", "product"],
    })
  );
};
