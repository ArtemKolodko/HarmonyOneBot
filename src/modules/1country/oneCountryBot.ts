import { Composer, InlineKeyboard } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";

import config from "../../config";
import { BotContext } from "../types";
import { relayApi } from "./api/relayApi";
import { AxiosError } from "axios";
import { getUrl } from './utils'
import { conversationDomainName } from './conversations'

export const oneCountry = new Composer<BotContext>();

oneCountry.use(conversations());
oneCountry.use(createConversation(conversationDomainName));

oneCountry.command("visit", async (ctx) => {
  if (!ctx.match) {
    ctx.reply("Error: Missing 1.country domain");
    return;
  }
  const url = getUrl(ctx.match);
  let keyboard = new InlineKeyboard().webApp("Go", `https://${url}/`);

  ctx.reply(`Visit ${url}`, {
    reply_markup: keyboard,
  });
});

oneCountry.command('rent', async (ctx) => {
  const prompt = ctx.match;
  if (!prompt) {
    ctx.reply("Error: Missing domain name");
    return;
  }
  ctx.reply('_Domain names can use a mix of letters and numbers, with no spaces_', {
    parse_mode: 'Markdown'
  })
  ctx.reply("Checking name...");
  await ctx.conversation.enter("conversationDomainName");
})

const text = 'You can renew your domain'
oneCountry.command("renew", async (ctx) => {
  if (!ctx.match) {
    ctx.reply("Error: Missing 1.country domain");
    return;
  }
  const url = getUrl(ctx.match);
  let keyboard = new InlineKeyboard()
    .webApp("Renew in 1.country", `https://${url}/?renew`)
    .row()
    .webApp("Renew ussing your local wallet", `https://${url}/`);

  ctx.reply(`Renew ${url}`, {
    reply_markup: keyboard,
  });
});

oneCountry.command("cert", async (ctx) => {
  if (!ctx.match) {
    ctx.reply("Error: Missing 1.country domain");
    return;
  }
  const url = getUrl(ctx.match);
  try {
    const response = await relayApi().createCert({ domain: url });
    if (!response.error) {
      ctx.reply(`The SSL certificate of ${url} was renewed`);
    } else {
      ctx.reply(`${response.error}`);
    }
  } catch (e) {
    ctx.reply(
      e instanceof AxiosError
        ? e.response?.data.error
        : "There was an error processing your request"
    );
  }
});

oneCountry.command("nft", async (ctx) => {
  if (!ctx.match) {
    ctx.reply("Error: Missing 1.country domain");
    return;
  }
  const url = getUrl(ctx.match);
  try {
    const response = await relayApi().genNFT({ domain: url });
    console.log(response);
    ctx.reply("NFT metadata generated");
  } catch (e) {
    console.log(e);
    ctx.reply(
      e instanceof AxiosError
        ? e.response?.data.error
        : "There was an error processing your request"
    );
  }
});

oneCountry.command("check", async (ctx) => {
  console.log("gen check");
  if (!ctx.match) {
    ctx.reply("Error: Missing 1.country domain");
    return;
  }
  try {
    const url = getUrl(ctx.match, false);
    const response = await relayApi().checkDomain({ sld: url });
    if (!response.error) {
      let msg = `The domain ${url}${config.country.tld} is ${
        !response.isAvailable ? "not available" : "available"
      }`;
      ctx.reply(msg);
    } else {
      ctx.reply(`${response.error}`);
    }
  } catch (e) {
    ctx.reply(
      e instanceof AxiosError
        ? e.response?.data.error
        : "There was an error processing your request"
    );
  }
});
