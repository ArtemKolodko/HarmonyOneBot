import { Composer } from "grammy";
import config from "../../config";
import { BotContext } from "../../bot";
import { imgGen, imgGenEnhanced, alterImg } from "./controller";

interface Image {
  url: string;
}

export interface ImageGenSessionData {
  numImages: number;
  imgSize: string;
}

export const imageGen = new Composer<BotContext>();

imageGen.command("gen", async (ctx) => {
  console.log("gen command");
  const prompt = ctx.match;
  if (!prompt) {
    ctx.reply("Error: Missing prompt");
    return;
  }
  const payload = {
    chatId: ctx.chat.id,
    prompt: ctx.match,
    numImages: ctx.session.imageGen.numImages,
    imgSize: ctx.session.imageGen.imgSize,
  };
  await imgGen(payload);
});

imageGen.command("genEn", async (ctx) => {
  console.log("genEn command");
  const prompt = ctx.match;
  if (!prompt) {
    ctx.reply("Error: Missing prompt");
    return;
  }
  const payload = {
    chatId: ctx.chat.id,
    prompt: ctx.match,
    numImages: await ctx.session.imageGen.numImages,
    imgSize: await ctx.session.imageGen.imgSize,
  };
  ctx.reply("generating improved prompt...");
  await imgGenEnhanced(payload);
});

imageGen.on("message", async (ctx) => {
  try {
    const photo = ctx.message.photo || ctx.message.reply_to_message?.photo;
    if (photo) {
      console.log("Alter img command");
      const prompt = ctx.message.caption || ctx.message.text;
      if (prompt) {
        const file_id = photo.pop()?.file_id; // with pop() get full image quality
        const file = await ctx.api.getFile(file_id!);
        const filePath = `${config.imageGen.telegramFileUrl}${config.telegramBotAuthToken}/${file.file_path}`; //  bot.token
        const payload = {
          chatId: ctx.chat.id,
          prompt: prompt,
          numImages: await ctx.session.imageGen.numImages,
          imgSize: await ctx.session.imageGen.imgSize,
          filePath: filePath,
        };
        await alterImg(payload);
      } else {
        ctx.reply("Please add edit prompt");
      }
    }
  } catch (e: any) {
    console.log(e);
    ctx.reply("An error occurred while generating the AI edit");
  }
});