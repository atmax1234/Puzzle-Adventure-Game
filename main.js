require("dotenv").config(); //to start process from .env file
const {
  Client,
  GatewayIntentBits,
  Partials,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");

const { createTeam, joinTeam, joinLobby, teams } = require("./team.js");
const { getTeamFromMember, getStartingClueForTeam } = require("./clue.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

const channelNames = ["start", "forest", "cave", "castle", "end"];
const accessRestrictions = {
  start: "@everyone",
  forest: "start",
  cave: "forest",
  castle: "cave",
  end: "castle",
}; //Channel Names and Role Names for the Channel and Role Creation Process

// Code to create channels in the category:
client.on("guildCreate", async (guild) => {
  const category = guild.channels.cache.find(
    (c) => c.name === "Puzzle Adventure Game" && c.type === "GUILD_CATEGORY"
  );
  if (!category) {
    const owner = await guild.fetchOwner();
    owner.send(
      "To create the Puzzle Adventure Game channels, please run the command !createpuzzlechannels in your server."
    );
    return;
  }

  for (const name of channelNames) {
    const channel = guild.channels.cache.find(
      (c) => c.name === name && c.parentId === category.id
    );
    if (channel) {
      owner.send(`Channel ${name} already exists.`);
    } else {
      const options = {
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: guild.roles.cache.find(
              (role) => role.name === accessRestrictions[name]
            ).id,
            allow: [PermissionsBitField.Flags.ViewChannel],
          },
        ],
        topic:
          channelNames.indexOf(name) > 0
            ? "This channel requires completion of the previous location to access."
            : "",
      };
      guild.channels.create(name, options).catch(console.error);
    }
  }
});

client.once("ready", () => {
  console.log("BOT IS ONLINE"); //message when bot is online
});

client.on("messageCreate", (message) => {
  const prefix = process.env.PREFIX;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  // removes prefix or bot mention

  const command = args.shift().toLowerCase();
  // gets command from next arg

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  if (command === "create-team") {
    const teamName = message.content.split(" ")[1];
    const captainName = message.author.username;
    const captain = message.guild.members.cache.get(message.author.id);
    const response = createTeam(teamName, captain, captainName);
    message.channel.send(response);
  } else if (command === "join-team") {
    const teamName = message.content.split(" ")[1];
    const player = message.author.username;
    const response = joinTeam(teamName, player, message.member);
    message.channel.send(response);
  } else if (command === "join-lobby") {
    const channelName = message.content.split(" ")[1];
    const player = message.author.username;
    const channel = message.guild.channels.cache.find(
      (channel) => channel.name === channelName
    );
    const response = joinLobby(channel, player);
    message.channel.send(response);
  } else if (command === "createpuzzlechannels") {
    const guild = message.guild;
    guild.channels
      .create("Puzzle Adventure Game", {
        type: ChannelType.GuildCategory,
      })
      .catch(console.error);
  } else if (command === "createGameRoles") {
    // Command to create the game roles
    // Command to create the game roles
    // Define an array of level names to use for role names and channel names
    const levels = ["Start", "Forest", "Cave", "Maze", "Final"];

    // Create a role for each level
    levels.forEach((level) => {
      message.guild.roles
        .create({
          name: level.toLowerCase(),
          mentionable: true,
        })
        .then((role) => {
          // Set up channel permissions for the role
          const channelName = level.toLowerCase();
          const channel = message.guild.channels.cache.find(
            (ch) => ch.name === channelName && ch.type === ChannelType.GuildText
          );
          if (!channel) {
            return message.channel.send(
              `Sorry, I couldn't find a channel named #${channelName}. Please create the channel first by using the following command: p$createpuzzlechannels`
            );
          }

          channel.permissionOverwrites
            .create({
              role: role,
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
            })
            .catch(console.error);

          channel.permissionOverwrites
            .create({
              role: message.guild.roles.everyone,
              deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
            })
            .catch(console.error);

          message.channel.send(
            `Created role ${role.name} and set up channel permissions for #${channelName}`
          );
        })
        .catch(console.error);
    });
  }else if (command === "startclue") { //Command which gives the first clue to the team
    const team = getTeamFromMember(message.member);
    if (team) {
      const startingClue = getStartingClueForTeam(team);
      message.channel.send(`Your starting clue is: ${startingClue}`);
    } else {
      message.channel.send('You need to be on a team to use this command!');
    }
  }
  else if (command === "teaminfo") {
    const memberName = message.content.split(' ')[1];
    const member = message.guild.members.cache.find(member => member.user.username === memberName) || message.mentions.members.first();
    if (!member) {
      return message.channel.send('Member not found. Please enter a valid member name or mention the member.');
    }
    const team = getTeamFromMember(member);
    if (!team) {
      return message.channel.send(`${member.displayName} is not on any team.`);
    }
    const position = teams[team].indexOf(member.displayName) + 1;
    if (member.displayName === teams[team][0].displayName) return message.channel.send(`${member.displayName} is the captain of team ${team}.`);
    return message.channel.send(`${member.displayName} is on team ${team} and is in position ${position} of ${teams[team].length}.`);
  }
});

client.login(process.env.TOKEN);
