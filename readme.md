# PomuBot - A Discord Bot based off of Luna Translations

Pomubot is an upgraded and modified version of Luna's translations.

## How to set up
* Make sure you have the latest version of Node.js download the required is >=18.0.0
* Make sure you have the latest version of Node Package Manager (NPM) installed.
* Make sure the latest version of MongoDB is installed on your server.
* Download PomuBot by cloning the repository.
* Modify the file `src/helpers/youtubeApi.ts` and replace YOUTUBE_API_KEY with your YouTube API key.
* Modify `.env.example` and replace the values with your own.
* Rename `.env.example` to .env
* Modify `src/config.ts` and replace Owner and Devs with your Discord ID.
* Modify `src/core/registerSlashCommands.ts` and replace client_id with the client ID of your bot.
* (Optional) Replace the channel ID in `src/core/events/guildCreate.ts` and `src/core/events/guildDelete.ts` with your own channel ID for bot logs.
* Move the PomuBot folder to your server or hosting platform and run `npm i` to install dependencies.
* Run `npm run tsc` to compile the TypeScript files.
* Run `node build/core/registerSlashCommands.js` to register slash commands to discord.
* Run `node build/index.js` to start the bot.

## This is a private repository
So please don't push any code or share this repository with anyone else.
The modifications to the source code are done purely for private use on allowed servers.

If there are any issues or questions please contact NobleNoishii on Discord.


## Hehe I suck at making readme's  just contact me if you have any questions on how to set up the bot.