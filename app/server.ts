import { Hono } from "hono";
import { inertia } from "@hono/inertia";
import { rootView } from "./root-view";

const app = new Hono();

app.use(inertia({ rootView }));

export default app
  .get("/", (c) => c.render("Home", {}))
  .all("*", (c) => {
    c.status(404);
    return c.redirect("/");
  });
