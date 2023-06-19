import express from "express";
import cors from "cors";
import { createConnection } from "typeorm";
import { routes } from "./routes";

createConnection().then(() => {
  const app = express();

  // middleware
  app.use(express.json());
  app.use(
    cors({
      origin: ["http://localhost:4200"],
    })
  );

  // routes
  routes(app);

  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`server is running at ${port}`);
  });
});
