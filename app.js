const Discord = require('discord.js');
const client = new Discord.Client();
var request = require('request');

require('dotenv').config();


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
  if (msg.content.startsWith('steam level')) {
    var uid = msg.content.split(' ')[2];
    console.log(uid);
    if (/^\d+$/.test(uid) && uid.length == 17) {
      get_level(uid, function (player_level) {
        if (player_level !== undefined) msg.reply('User ' + uid + ' is currently at level ' + player_level);
        else msg.reply('User ' + uid + ' not found');
      });
    } else {
    request('https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=' + process.env.STEAM_API_KEY + '&vanityurl=' + uid, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      try{
        var jsonobj = body;
        var jsonparsed = JSON.parse(jsonobj);
        if (jsonparsed.response.steamid == undefined) {
          msg.reply('User ' + uid + ' not found');
        } else {
          console.log(jsonparsed.response.steamid)
          get_level(jsonparsed.response.steamid, function (player_level) {
            msg.reply('User ' + uid + ' is currently at level ' + player_level);
          });
        }
      } catch (e) {
        msg.reply('There was an API error');
      }
      
    }
  })
  }
  }

  if (msg.content.startsWith('help') || msg.content.startsWith('!help')){
    msg.reply('Currently active commands: \n "help": shows this page \n "steam level id": returns steam level from custom id or id64');
  }

});

function get_level (steamID, callback) {
  var player_level;
  request('https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=' + process.env.STEAM_API_KEY + '&steamid=' + steamID, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var jsonobj = body;
        var jsonparsed = JSON.parse(jsonobj);
        if (jsonparsed.response.player_level !== undefined) {
          player_level = jsonparsed.response.player_level;
        }
    }
  callback(player_level);
  });
}

client.login(process.env.DISCORD_TOKEN);