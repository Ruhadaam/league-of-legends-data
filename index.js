const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const axios = require('axios');
const token = '6981076150:AAF5NqbwiR7RHSFNB9HeLAnZKuR8hPDgz1I';
const bot = new TelegramBot(token, { polling: true });

const path = require('path');

let chatID;
let name;
let surname;
bot.onText(/\/start/, (msg) => {
    chatID = msg.chat.id;
    name = msg.chat.first_name;
    surname = msg.chat.last_name;
    bot.sendMessage(chatID, `Merhaba ${name} ${surname} ! Hoşgeldin.`)
    bot.sendMessage(chatID, `Bu Bot lol şampiyonları hakkında bilgiler almak için yapılmıştır. Nasıl kullanacağını bilmiyorsan /help komutunu kullanabilirsin.`);
    console.log(msg);
});


bot.onText(/\/help/, async (msg) => {
    chatID = msg.chat.id;

    // 1. Mesajı gönder
    await bot.sendMessage(chatID, `
    <b>ŞAMPİYON BİLGİSİ</b>
/sampiyonlar yazarak tüm şampiyonları görebilirsin.
/sampiyon - <i>şampiyon adı</i> yazdıktan sonra bir şampiyon ismini aratırsan, şampiyon hakkında bilgileri görebilirsin. 
Örnek:
'/sampiyon Ahri'
'/sampiyon Yasuo'
'/sampiyon Jinx'
    `,{ parse_mode: 'html' });

    // 2. Mesajı 2 saniye sonra gönder
    await delay(2000);

 
   
});


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}





bot.onText(/\/sampiyon (.+)/, (msg, match) => {
    const chatID = msg.chat.id;
    const championName = match[1]
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    const name = championName; 

    axios.get(`https://ddragon.leagueoflegends.com/cdn/14.2.1/data/tr_TR/champion/${name}.json`)
    .then(function (response) {
        const championData = response.data.data[name];

        const champion = championData.name;
        const title = championData.title;
        const blurb = championData.blurb;
        const roles = championData.tags.join(', ');
        const tips = championData.enemytips && championData.enemytips.length > 0
        ? championData.enemytips.join('\n \n')
        : 'bilgi bulunamadı.';
    

        const imageUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${name}_0.jpg`;

        // Resmi ve metni bir arada gönderme
        bot.sendPhoto(chatID, imageUrl, {
            caption: `
🌟 <b>${champion}(${title}) Bilgileri</b>

📖 <b>Açıklama:</b>
${blurb}

🗡️ <b>Rol:</b>

<i>${roles}</i>

<b>Öneri:</b>

<i>${tips}</i>

            `,
            parse_mode: 'html'
        });

        })
        .catch(function (error) {
            // handle error
            console.log(error);
        });
});

bot.onText(/\/sampiyonlar/, (msg) => {
    axios.get(`https://ddragon.leagueoflegends.com/cdn/14.2.1/data/tr_TR/champion.json`)
    .then(function (response) {
        return response.data.data; // Assuming the data is in the response.data.data property
    })
    .then(data => {
        let championsList = '';
        let count = 1;

        Object.keys(data).forEach(championKey => {
            const champion = data[championKey];
            championsList += `${count}- ${champion.name}\n`;
            count++;
        });

        bot.sendMessage(msg.chat.id, championsList);
        bot.sendMessage(msg.chat.id, `<b>Dikkat:</b> Nunu ve Willump istisna şampiyondur 'nunu' yazmanız yeterlidir.` ,{ parse_mode: 'html' });
    })
    .catch(error => {
        console.error("Error fetching champion data:", error);
    });
});


