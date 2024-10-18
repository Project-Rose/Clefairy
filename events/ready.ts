import { Events } from "npm:discord.js"; 
import { bold, brightGreen } from "jsr:@std/fmt/colors";

export default {
  modulename : "Initial/Loader Event Listener",
  name: Events.ClientReady,
  once: true,
  execute(client: any) {
    console.log(
        (bold(brightGreen(`[SUCESS] We are ready to go! Clefairy is running as ${client.user.tag}`))),
      );
  },
};
