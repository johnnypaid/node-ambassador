import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { client } from "../app";
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

// for the frontend content
export const ProductsFrontend = async (req: Request, res: Response) => {
  // use caching to limit querying the database.. specifically expensive queries thus making endpoints faster
  // get the products from the cached product_content
  let products = JSON.parse(await client.get("product_content"));

  // if no existing cached products or cache expires then query product and set the key product_content
  if (!products) {
    products = await getRepository(Product).find();

    await client.set("product_content", JSON.stringify(products), { EX: 1800 }); // 1800 = 30mins
  }

  res.send(products);
};

export const ProductsBackend = async (req: Request, res: Response) => {
  let products: Product[] = JSON.parse(await client.get("product_content"));

  if (!products) {
    products = await getRepository(Product).find();

    await client.set("product_content", JSON.stringify(products), { EX: 1800 });
  }

  // search variable is set
  if (req.query.search) {
    const search = req.query.search.toString().toLowerCase();

    products = products.filter(
      (e) =>
        e.title.toLowerCase().indexOf(search) >= 0 ||
        e.description.toLowerCase().indexOf(search) >= 0
    );
  }

  // sort the product
  if (req.query.sort === "asc" || req.query.sort === "desc") {
    products.sort((a, b) => {
      const diff = a.price - b.price;

      if (diff === 0) return 0;

      const sortProduct = Math.abs(diff) / diff; // -1, 1

      return req.query.sort === "asc" ? sortProduct : -sortProduct;
    });
  }

  // pagination
  // typescript: add as any to parse as an int. In case there is no page query set page var to 1;
  const page: number = parseInt(req.query.page as any) || 1;
  const perPage: number = 9;
  const total = products.length;

  const data = products.slice((page - 1) * perPage, page * perPage);

  res.send({ data, total, page, last_page: Math.ceil(total / perPage) });
};
