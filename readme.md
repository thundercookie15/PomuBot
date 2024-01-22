# PomuBot - A Discord Bot based off of Luna Translations

Pomubot is an upgraded and modified version of Luna's translations. Adding many new features and just general
improvements.

Code is ugly, will I clean it up? Idk, maybe. Does it work, yea.

## Features

- Relaying YouTube livestream chat translations in real time from YouTube livechat to Discord
- Relaying channel owner and channel mod messages
- Relaying a streamer's activity in other streamers' livestream chat
- Sending notifications for community posts, YouTube streams, TwitCasting streams
- Easy translator blacklisting system
- Manual blacklisting system
- Relay prechat messages up to 24 hours of initial livestream
- Discord Native Permissions


## How to set up
### Pre-requisites

* Make sure you have the latest version of Node.js download the required is >=18.0.0
* Make sure you have the latest version of Node Package Manager (**NPM**) installed.
* Make sure the latest version of MongoDB is installed on your server.

### Setting up the bot
* Download PomuBot by cloning the repository or downloading it as a ZIP file and extracting it.
* Modify the file `src/helpers/youtubeApi.ts` and replace YOUTUBE_API_KEY with your YouTube API key.
* Modify `.env.example` and replace the values with your own.
* Rename `.env.example` to `.env`
* Modify `src/config.ts` and replace OwnerId with your Discord ID. You can leave DevID empty, it's not required.
* Modify `src/core/registerSlashCommands.ts` and replace client_id with the client ID of your bot.
* Modify `src/core/registerSlashCommands.ts` and replace GUILD_ID_FOR_PERSONAL_COMMANDS with the guild ID of your own testing server. Commands under `src/core/guildcommands` can only be run in the set guild.
* (Optional) Replace the channel ID in `src/core/events/guildCreate.ts` and `src/core/events/guildDelete.ts` with your
  own channel ID for bot logs. 
* (Optional) Replace the channel ID in `src/index.ts` to your own logging channel ID for bot error logging.
* Move the PomuBot folder to your server or hosting platform and run `npm i` to install dependencies.
* Run `npm run tsc` to compile the TypeScript files.
* Run `node build/core/registerSlashCommands.js` to register slash commands to discord.
* Run `node build/index.js` to start the bot.
* When the bot is invited to a server, it will automatically assign default permissions to all of it's commands. Permissions for commands can be managed by the server's administrators in the Discord server settings under the Integrations tab.



## Credits
This bot would not be possible without the original source code from Luna Translations.

### Note

I am not affiliated with Luna Translations in any way. I just use the source code and built on it.

I don't really make readme's or guides on how to set up stuff. So if you don't understand tech or code. I'm sorry.

If there are any issues or questions please contact NobleNoishii on Discord.