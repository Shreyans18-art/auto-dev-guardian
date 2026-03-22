import prBot from "./bots/prBot.js";
import ciBot from "./bots/ciBot.js";

export default (app) => {
  prBot(app);
  ciBot(app);
};