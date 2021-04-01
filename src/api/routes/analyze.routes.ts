import * as controller from "../controllers/analyze.controller";
import { Express } from "../server";

export function routes(app: Express) {
  /*
   * Analyze Payload for threats against all integrations
   */
  app.post("/analyze", controller.analyze);
}
