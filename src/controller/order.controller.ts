import { Request, Response } from "express";
import { getConnection, getRepository } from "typeorm";
import { Link } from "../entity/link.entity";
import { OrderItem } from "../entity/order-item.entity";
import { Order } from "../entity/order.entity";
import { Product } from "../entity/product.entity";
import Stripe from "stripe";
import { client } from "../app";
import { User } from "../entity/user.entity";
import { createTransport } from "nodemailer";

export const Orders = async (req: Request, res: Response) => {
  const orders = await getRepository(Order).find({
    where: { complete: true },
    relations: ["order_items"], // load the order items so that the total getter from order entity will work.
  });

  res.send(
    orders.map((order: Order) => ({
      id: order.id,
      name: order.name,
      email: order.email,
      total: order.total,
      created_at: order.created_at,
      order_items: order.order_items,
    }))
  );
};

export const CreateOrder = async (req: Request, res: Response) => {
  const body = req.body;

  console.log(body);

  const link = await getRepository(Link).findOne({
    where: { code: body.code },
    relations: ["user"],
  });

  if (!link) {
    return res.status(400).send({ message: "Invalid link!" });
  }

  const queryRunner = getConnection().createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();
    // create a new order
    let order = new Order();
    order.user_id = link.user.id;
    order.ambassador_email = link.user.email;
    order.code = body.code;
    order.first_name = body.first_name;
    order.last_name = body.last_name;
    order.email = body.email;
    order.address = body.address;
    order.country = body.country;
    order.city = body.city;
    order.zip = body.zip;

    order = await queryRunner.manager.save(order);

    const line_items = [];

    for (let p of body.product) {
      const product = await getRepository(Product).findOne({
        where: { id: p.product_id },
      });

      console.log(product);

      const orderItem = new OrderItem();

      orderItem.order = order;
      orderItem.product_title = product.title;
      orderItem.price = product.price;
      orderItem.quantity = p.quantity;
      orderItem.ambassador_revenue = 0.1 * product.price * p.quantity;
      orderItem.admin_revenue = 0.9 * product.price * p.quantity;

      await queryRunner.manager.save(orderItem);

      line_items.push({
        price_data: {
          currency: "usd",
          unit_amount: 100 * product.price, // multiple by qoo to get the exact amount
          product_data: {
            name: product.title,
            description: product.description,
            images: [product.image],
          },
        },
        quantity: p.quantity,
      });
    }

    // use stripe first before commiting transaction
    const stripe = new Stripe(process.env.STRIPE_SECRET, {
      apiVersion: "2022-11-15",
    });

    const source = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.CHECKOUT_URL}/success?source={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CHECKOUT_URL}/error`,
    });

    order.transaction_id = source["id"]; // this important for every order for stripe to verify or check for an error
    await queryRunner.manager.save(order);

    await queryRunner.commitTransaction();

    res.send(source); // frontend will get his source and redirect to stripe
  } catch (error) {
    console.log(error);
    await queryRunner.rollbackTransaction();

    return res.status(400).send({ message: "Error occured!" });
  }
};

export const ConfirmOrder = async (req: Request, res: Response) => {
  const repository = getRepository(Order);

  const order = await repository.findOne({
    where: {
      transaction_id: req.body.source,
    },
    relations: ["order_items"],
  });

  if (!order) {
    return res.status(404).send({ message: "Order not found." });
  }

  await getRepository(Order).update(order.id, { complete: true });

  // get user name to be use for revenue ranking
  const user = await getRepository(User).findOne({
    where: { id: order.user_id },
  });
  // update redis for sales ranking or increase user revenue update
  await client.zIncrBy("rankings", order.ambassadorTotal, user.name);

  // node mailer
  const transporter = createTransport({
    host: "host.docker.internal",
    port: 1025,
  });

  // admin email
  await transporter.sendMail({
    from: "from@example.com",
    to: "admin@admin.com",
    subject: "An order has been completed",
    html: `Order #${order.id} with a total of $${order.total} has been completed.`,
  });

  // ambassador email
  await transporter.sendMail({
    from: "from@example.com",
    to: order.ambassador_email,
    subject: "An order has been completed",
    html: `You earned $${order.ambassadorTotal} from the link ${order.code}`,
  });

  transporter.close();

  res.send({
    message: "success",
  });
};
