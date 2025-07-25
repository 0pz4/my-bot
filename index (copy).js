const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const fs = require("fs");
// ====== 1. إعداد UPTIME ======
const express = require("express");
const server = express();

server.all("/", (req, res) => {
  res.send("✅ البوت يعمل حالياً");
});

function keepAlive() {
  server.listen(3000, () => {
    console.log("✅ [UPTIME] السيرفر شغّال");
  });
}
keepAlive();

const fetch = require("node-fetch");

setInterval(
  () => {
    fetch(
      "https://7b1cd174-b65c-44c6-bcf5-13e51fce8397-00-1hqtdxjo05nkr.pike.replit.dev",
    );
  },
  4 * 60 * 1000,
);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

// عدل البيانات هنا
const TOKEN =
  "MTM5NzkwNzgwNzU3MDg5MDg4NA.GToVb5._-Ve-DJNEOWrrAcSMUVvlr3CZzcknHZE0McG_k";
const supportRoleId = "1397910105839898684";
const gtaRoleId = "1398312814401163386";
const menuChannelId = "1397897599339724853";
const gtaChannelId = "1397900292221046804";
const pingChannelId = "1398286116653764619";

const categoryIds = {
  support: "1397897503336038471",
  complaint: "1397897503336038471",
  developer: "1397897503336038471",
  gta: "1397900217411698869",
};

let ticketCount = 0;
if (fs.existsSync("ticketCount.json")) {
  ticketCount = JSON.parse(fs.readFileSync("ticketCount.json")).count || 0;
}

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const menuChannel = await client.channels.fetch(menuChannelId);
  const gtaChannel = await client.channels.fetch(gtaChannelId);

  if (menuChannel) {
    const embed = new EmbedBuilder()
      .setTitle("🎫 نظام التذاكر")
      .setDescription("اختر نوع التذكرة من القائمة أدناه:")
      .setColor("Blue");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("open-ticket")
      .setPlaceholder("اختر نوع التذكرة")
      .addOptions([
        { label: "دعم فني", value: "support", emoji: "🛠️" },
        { label: "شكوى", value: "complaint", emoji: "📢" },
        { label: "تقديم مبرمج", value: "developer", emoji: "💻" },
      ]);

    await menuChannel.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)],
    });
  }

  if (gtaChannel) {
    const embed = new EmbedBuilder()
      .setTitle("🎮 تذكرة قراند")
      .setDescription("اضغط الزر لفتح تذكرة خاصة بـ GTA.")
      .setColor("Red");

    const button = new ButtonBuilder()
      .setCustomId("gta-ticket")
      .setLabel("🎫 فتح تذكرة قراند")
      .setStyle(ButtonStyle.Primary);

    await gtaChannel.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(button)],
    });
  }

  // إرسال 101🏓 كل دقيقتين
  setInterval(
    () => {
      const channel = client.channels.cache.get(pingChannelId);
      if (channel) channel.send("101🏓");
    },
    2 * 60 * 1000,
  );
});
const claimedTickets = {};

client.on("interactionCreate", async (interaction) => {
  if (
    interaction.isStringSelectMenu() &&
    interaction.customId === "open-ticket"
  ) {
    ticketCount++;
    fs.writeFileSync(
      "ticketCount.json",
      JSON.stringify({ count: ticketCount }),
    );

    const type = interaction.values[0];
    const categoryId = categoryIds[type];
    const user = interaction.user;

    const channel = await interaction.guild.channels.create({
      name: `ticket-${user.username}-${ticketCount}`,
      type: 0,
      parent: categoryId,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: supportRoleId, allow: [PermissionsBitField.Flags.ViewChannel] },
      ],
    });

    const embed = new EmbedBuilder()
      .setTitle("🎟️ تذكرة جديدة")
      .setDescription(`مرحباً ${user}, سيتم الرد عليك قريباً.`)
      .setColor("Green");

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("claim")
        .setLabel("استلام")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("unclaim")
        .setLabel("ترك")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("close")
        .setLabel("قفل")
        .setStyle(ButtonStyle.Danger),
    );

    await channel.send({
      content: `<@${user.id}>`,
      embeds: [embed],
      components: [buttons],
    });
    await interaction.reply({
      content: `✅ تم فتح تذكرتك: ${channel}`,
      ephemeral: true,
    });
  } else if (interaction.isButton()) {
    const { customId, user, channel } = interaction;

    if (customId === "gta-ticket") {
      ticketCount++;
      fs.writeFileSync(
        "ticketCount.json",
        JSON.stringify({ count: ticketCount }),
      );

      const gtaCatId = categoryIds["gta"];

      const gtaChannel = await interaction.guild.channels.create({
        name: `gta-${user.username}-${ticketCount}`,
        type: 0,
        parent: gtaCatId,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel] },
          { id: gtaRoleId, allow: [PermissionsBitField.Flags.ViewChannel] },
        ],
      });

      const embed = new EmbedBuilder()
        .setTitle("🎮 تذكرة قراند")
        .setDescription(`مرحباً ${user}, سيتم خدمتك قريباً بواسطة فريق قراند.`)
        .setColor("Orange");

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("claim")
          .setLabel("استلام")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("unclaim")
          .setLabel("ترك")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("close")
          .setLabel("قفل")
          .setStyle(ButtonStyle.Danger),
      );

      await gtaChannel.send({
        content: `<@${user.id}>`,
        embeds: [embed],
        components: [buttons],
      });
      await interaction.reply({
        content: `✅ تم فتح تذكرة قراند: ${gtaChannel}`,
        ephemeral: true,
      });
    } else if (customId === "claim") {
      if (
        !interaction.member.roles.cache.has(supportRoleId) &&
        !interaction.member.roles.cache.has(gtaRoleId)
      ) {
        return interaction.reply({
          content: "❌ ما عندك صلاحية للاستلام.",
          ephemeral: true,
        });
      }

      claimedTickets[channel.id] = user.id;
      await channel.permissionOverwrites.edit(user.id, {
        ViewChannel: true,
        SendMessages: true,
      });
      await interaction.reply({
        content: `🎟️ تم استلام التذكرة بواسطة ${user}`,
        ephemeral: false,
      });
    } else if (customId === "unclaim") {
      if (claimedTickets[channel.id] !== user.id) {
        return interaction.reply({
          content: "❌ فقط المستلم يقدر يترك.",
          ephemeral: true,
        });
      }

      delete claimedTickets[channel.id];
      await channel.permissionOverwrites.edit(user.id, { ViewChannel: false });
      await interaction.reply({
        content: `🔓 تم ترك التذكرة بواسطة ${user}`,
        ephemeral: false,
      });
    } else if (customId === "close") {
      if (claimedTickets[channel.id] !== user.id) {
        return interaction.reply({
          content: "❌ فقط المستلم يقدر يقفل التذكرة.",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: "🔒 سيتم إغلاق التذكرة خلال 3 ثوانٍ...",
      });
      setTimeout(() => channel.delete(), 3000);
    }
  }
});
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("+نداء")) {
    const mention = message.mentions.users.first();

    if (!mention) {
      return message.reply(
        "❌ | منشن الشخص اللي تبي تناديه، مثل:\n`+نداء @username`",
      );
    }

    const embed = new EmbedBuilder()
      .setTitle("🔔 نداء خاص!")
      .setDescription(
        `📢 تم نداءك يا ${mention}!\nهناك من يطلب حضورك، لا تتأخر علينا!`,
      )
      .setColor("Gold")
      .setThumbnail(mention.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `المرسل: ${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    message.reply({ content: `✅ | تم نداء ${mention}`, embeds: [embed] });
  }
});

// تسجيل دخول البوت
client.login(TOKEN);
