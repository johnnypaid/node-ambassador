import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Product } from "../entity/product.entity";

export const Products = async (req: Request, res: Response) => {
  res.send(await getRepository(Product).find());
};

export const CreateProducts = async (req: Request, res: Response) => {
  try {
    res.status(201).send(await getRepository(Product).save(req.body));
  } catch (error) {
    res.send({ message: "Something went wrong" });
  }
};

export const GetProduct = async (req: Request, res: Response) => {
  try {
    res.send(await getRepository(Product).findOneBy({ id: req.params.id }));
  } catch (error) {
    res.send({ message: "Something went wrong" });
  }
};

export const UpdateProduct = async (req: Request, res: Response) => {
  try {
    const repository = getRepository(Product);

    await repository.update(req.params.id, req.body);

    res.send(await repository.findOneBy({ id: req.params.id }));
  } catch (error) {
    res.send({ message: "Something went wrong" });
  }
};

export const DeleteProduct = async (req: Request, res: Response) => {
  await getRepository(Product).delete(req.params.id);

  res.status(204);
};
