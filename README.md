# WizCraftBot-1.0

A discord bot of epic awesomeness.

# Getting Started

Make sure to have Node.js installed.

Clone the repo.

```bash
git clone https://github.com/wizardassassin/WizCraftBot-1.0.git
cd WizCraftBot-1.0
```

Install the dependencies

```bash
npm i
# or
npm ci # clean install
```

Update the .env file  
The bot token and client id are needed for the discord bot to work,  
while the other variables are needed for certain commands.

```bash
cp .env.example .env
nano .env # edit the file
```

Compile the code

```bash
# npx tsc
npm run build
```

Deploy the commands and database

```bash
# node ./dist/deploy-commands.js
npm run deploy-cmd
# prisma generate && prisma migrate deploy
npm run deploy-prisma
```

Run the code using pm2 or in the terminal

```bash
pm2 start ecosystem.config.cjs
# or
npm run dev # cd ./dist/ && node .
```

# TODO

-   Comments and JSDocs
-   99% embed only replies.
-   Pages for the queue command.
-   More refined music bot logic.
-   Option for looping the music queue x times.
-   More refined code.
-   History api command.
-   Adding the ability to input options for the api.
-   College acceptance command.
-   Chess command.
-   Add TypeScript.
-   Add hypixel api integration.
-   Maybe use an AttachmentBuilder
-   Add more documentation
-   Refactor command handling

# Notes

-   TypeScript?
