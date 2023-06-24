import bcrypt from "bcryptjs";
import { createConnection, getRepository } from "typeorm";
import { User } from "../entity/user.entity";
import { faker } from "@faker-js/faker";

createConnection().then(async () => {
  const repository = getRepository(User);
  const password = await bcrypt.hash("1234", 10);

  for (let i = 0; i < 20; i++) {
    await repository.save({
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      password,
      is_ambassador: true,
    });
  }

  process.exit();
});

// run the command inside docker since we are using database inside docker
