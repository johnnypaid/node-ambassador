import { createConnection, getRepository } from "typeorm";
import { Product } from "../entity/product.entity";
import { faker } from "@faker-js/faker";
import { randomInt } from "crypto";

createConnection().then(async () => {
  const repository = getRepository(Product);

  for (let i = 1; i < 29; i++) {
    await repository.save({
      title: faker.lorem.words(2),
      description: faker.lorem.words(10),
      image: faker.image.imageUrl(200, 200, "", true),
      price: randomInt(10, 100),
    });
  }

  process.exit();
});

// run the command inside docker since we are using database inside docker
// run inside docker compose
// docker compose exec backend sh
// npm run seed:ambassadors
