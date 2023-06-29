import { createConnection, getRepository } from "typeorm";
import { faker } from "@faker-js/faker";
import { randomInt } from "crypto";
import { Link } from "../entity/link.entity";
import { User } from "../entity/user.entity";

createConnection().then(async () => {
  const repository = getRepository(Link);

  for (let i = 0; i < 29; i++) {
    const user = new User();
    user.id = i + 1;

    await repository.save({
      code: faker.random.alphaNumeric(6),
      user,
      price: [randomInt(1, 30)],
    });
  }

  process.exit();
});

// run the command inside docker since we are using database inside docker
// run inside docker compose
// docker compose exec backend sh
// npm run seed:ambassadors
