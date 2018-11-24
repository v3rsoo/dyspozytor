const botconfig = require('./botconfig.json');
const Discord = require('discord.js');
const fs = require("fs");
const bot = new Discord.Client({disableEveryone: true});
const logsfooter = "System logów by v3rso";
const lsfdfooter = "Los Santos Fire Department";
const ownerID = '140186870322692097'
const active = new Map();
const prefix = botconfig.prefix;

global.servers = {};
bot.commands = new Discord.Collection();


/*fs.readdir("./commands/", (err, files) => {
    if (err) console.log(err)
    let jsfile = files.filter(f => f.split(".").pop() === "js")
    if(jsfile.length <= 0){
        console.log("Nie udało się znaleźć komend.");
        return;
    }

    jsfile.forEach((f, i) =>{
        let props = require(`./commands/${f}`);
        console.log(`Załadowano ${f}!`);
        bot.commands.set(props.help.name, props);
    });

});
*/
bot.on("ready", async () => {
    console.log(`${bot.user.username} jest online!`);
    bot.user.setActivity('Fire Department', { type: 'PLAYING' });
});

bot.on("message", message => {
    let args = message.content.slice(prefix.length).trim().split(' ');
    let cmd = args.shift().toLowerCase();

    /*let commandfile = bot.commands.get(cmd.slice(prefix.length));
    if(commandfile) commandfile.run(bot,message,args);*/

    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;

    try {
        delete require.cache[require.resolve(`./commands/${cmd}.js`)];
        let ops = {
            ownerID: ownerID,
            active: active
        }

        let commandFile = require(`./commands/${cmd}.js`)
        commandFile.run(bot, message, args, ops);

    } catch (e) {
        console.log(e.stack);
    }

});

//wiadomość powitalana

bot.on('guildMemberAdd', member => {
    let bicon = bot.user.displayAvatarURL
    let joinembed = new Discord.RichEmbed()
    .setThumbnail(bicon)
    .setAuthor(member.user.tag, member.user.displayAvatarURL)
    .setTitle("Nowy członek LSFD!")
    .setDescription("Witamy na pokładzie! **Zapoznaj się z poniższymi informacjami!**\n")
    .addField("Nick", "Pierwszą rzeczą jaką powinieneś wykonać będzie ustawienie nicku twojej postaci na discordzie. Aby tego dokonać wpisz komendę **!nick** i po spacji wstaw nick.", true)
    .addField("Strona", "Kolejnym krokiem będzie założenie konta na naszej stronie internetowej. Znajdziesz ją pod adresem: **xnxx.com**", true)
    .addField("Ustawienia strony", "Po zaakceptowaniu twojego konta na stronie wejdź w ustawienia i koniecznie ustaw swoje Discord ID. Pomoże to w ustawianiu Tobie odpowiednich rang.", true)
    .addField("Forum", "Koniecznie prześlij v3rso w prywatnej wiadomości link do swojego konta na forum. Otrzymasz na nim specjalną rangę, która umożliwi Ci wgląd do specjalnych działów. Gdy uzyskasz już do nich dostęp koniecznie zapoznaj się z tematami w dziale **Forum wewnętrzne** oraz **Materiały szkoleniowe**.")
    .addBlankField()
    .addField("Zakończenie", "Jeżeli wykonałeś wszystkie powyższe zadania możesz udać się do zarządu, który wprowadzi Cię do gry. Mamy nadzieję, że nasza frakcja przypadnie Ci do gustu!", true)
    .setColor("#008000")
    .setFooter(lsfdfooter, bot.user.displayAvatarURL)
    .setTimestamp();
    bot.channels.find("name", "test2").send(joinembed)
    return;
});

//wiadomość pożegnalna
bot.on('guildMemberRemove', member => {
    let bicon = bot.user.displayAvatarURL
    let leaveembed = new Discord.RichEmbed()
    .setThumbnail(bicon)
    .setAuthor(member.user.tag, member.user.displayAvatarURL)
    .setTitle("Opuścił szeregi LSFD.")
    .setDescription("Pamiętaj o zaktualizowaniu strony!")
    .setColor("#FF0000")
    .setFooter(lsfdfooter, bot.user.displayAvatarURL)
    .setTimestamp();
    bot.channels.find("name", "test2").send(leaveembed)
    return;
});


//usunięta wiadomość
bot.on("messageDelete", (messageDelete) =>{
    let deletelog = new Discord.RichEmbed()
    .setTitle("Usunięto wiadomość.")
    .setDescription(`**${messageDelete.author.tag}** na kanale ${messageDelete.channel} \n ${messageDelete.content}`)
    .setColor("#b72212")
    .setFooter(logsfooter, bot.user.displayAvatarURL)
    .setTimestamp();
    bot.channels.find("name", "test2").send(deletelog)
    return;
});

//edytowana wiadomość
bot.on("messageUpdate", async(oldMessage, message) => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;
  if(!oldMessage.content) return;
  if(!message.content) return;
  if(message.content == oldMessage.content) return;
  let mEmbed = new Discord.RichEmbed()
  .setTitle(`Edytowano wiadomość.`)
  .setDescription(`**${message.author.tag}** na kanale ${message.channel}`)
  .setColor("#b75f12")
  .setTimestamp()
  .addField("Oryginalna wersja", oldMessage.content, true)
  .addField("Edytowana wersja", message.content)
  .setFooter(logsfooter, bot.user.displayAvatarURL)
  bot.channels.find("name", "test2").send(mEmbed);
});

//zmiana rangi
bot.on("guildMemberUpdate", async(oldMember, newMember) => {
    if(oldMember.displayName !== newMember.displayName) return;
    if(oldMember.roles !== newMember.roles) {
        let roles = newMember.roles.array()
        let roles2 = roles.splice(0,1)
        let roleupdatemsg = new Discord.RichEmbed()
        .setTitle(`Rangi użytkownika uległy zmianie.`)
        .setAuthor(oldMember.user.tag, oldMember.user.displayAvatarURL)
        .setColor("#f4b942")
        .setTimestamp()
        .setDescription(roles)
        .setFooter(logsfooter, bot.user.displayAvatarURL)
        bot.channels.find("name", "test2").send(roleupdatemsg);
    } else {
        return;
    }
});

//unban
bot.on("guildBanRemove", (guild, user) => {
    let unbanmsg = new Discord.RichEmbed()
    .setTitle(`Uzytkownik został odbanowany.`)
    .setAuthor(user.tag, user.displayAvatarURL)
    .setColor("#6bf442")
    .setTimestamp()
    .setFooter(logsfooter, bot.user.displayAvatarURL)
    bot.channels.find("name", "test2").send(unbanmsg)
    return;
});

//usunięcie kanału
bot.on("channelDelete", (channel) => {
    let chdeletemsg = new Discord.RichEmbed()
    .setTitle(`Kanały uległy zmianie.`)
    .setColor(`#FF0000`)
    .setTimestamp()
    .setFooter(logsfooter, bot.user.displayAvatarURL)
    .setDescription(`Kanał **${channel.name}** został usunięty!`)
    bot.channels.find("name", "test2").send(chdeletemsg)
});

//usunięcie roli
bot.on("roleDelete", (role) => {
    let roledelmsg = new Discord.RichEmbed()
    .setTitle(`Role uległy zmianie.`)
    .setColor(`#FF0000`)
    .setTimestamp()
    .setFooter(logsfooter, bot.user.displayAvatarURL)
    .setDescription(`Rola **${role.name}** została usunięta!`)
    bot.channels.find("name", "test2").send(roledelmsg)
});

//połączenie bota
bot.login(process.env.BOT_TOKEN);
