import fetch from 'node-fetch';

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
   let tee = `✳️ ${mssg.notext}\n\n📌 ${mssg.example}: *${usedPrefix + command}* MEGA AI`
   m.react('⌛')

   let apiUrl;
   switch (command) {
      case 'mascot':
         if (!text) throw tee;
         apiUrl = `https://globaltech-api.onrender.com/api/ephoto/mascot?apikey=APIKEY&text=${encodeURIComponent(text)}`;
         break;
         
      case 'logomaker':
         if (!text) throw tee;
         apiUrl = `https://api.giftedtech.web.id/api/ephoto360/logomaker?apikey=gifted-md&text=${encodeURIComponent(text)}`;
         break;

         case 'cartoon':
         if (!text) throw tee;
         apiUrl = `https://api.giftedtech.web.id/api/ephoto360/cartoonstyle?apikey=gifted-md&text=${encodeURIComponent(text)}`;
         break;

         case 'writetext':
         if (!text) throw tee;
         apiUrl = `https://api.giftedtech.web.id/api/ephoto360/writetext?apikey=gifted-md&text=${encodeURIComponent(text)}`;
         break;

         case 'glossy':
         if (!text) throw tee;
         apiUrl = `https://api.giftedtech.web.id/api/ephoto360/glossysilver?apikey=gifted-md&text=${encodeURIComponent(text)}`;
         break;
         
      case 'bpstyle':
         if (!text) throw tee;
         apiUrl = `https://api.giftedtech.web.id/api/ephoto360/blackpinkstyle?apikey=gifted-md&text=${encodeURIComponent(text)}`;
         break;

      case 'pixelglitch':
         if (!text) throw tee;
         apiUrl = `https://api.giftedtech.web.id/api/ephoto360/pixelglitch?apikey=gifted-md&text=${encodeURIComponent(text)}`;
         break;

      case 'advancedglow':
         if (!text) throw tee;
         apiUrl = `https://api.giftedtech.web.id/api/ephoto360/advancedglow?apikey=gifted-md&text=${encodeURIComponent(text)}`;
         break;

      case 'lighteffect':
         if (!text) throw tee;
         apiUrl = `https://api.giftedtech.web.id/api/ephoto360/lighteffect?apikey=gifted-md&text=${encodeURIComponent(text)}`;
         break;

      case 'texteffect':
         if (!text) throw tee;
         apiUrl = `https://api.giftedtech.web.id/api/ephoto360/texteffect?apikey=gifted-md&text=${encodeURIComponent(text)}`;
         break;

      case 'galaxy':
         if (!text) throw tee;
         apiUrl = `https://api.giftedtech.web.id/api/ephoto360/galaxy?apikey=gifted-md&text=${encodeURIComponent(text)}`;
         break;

      case 'beach':
         if (!text) throw tee;
         apiUrl = `https://api.giftedtech.web.id/api/ephoto360/summerbeach?apikey=gifted-md&text=${encodeURIComponent(text)}`;
         break;

      case 'clouds':
         if (!text) throw tee;
         apiUrl = `https://api.giftedtech.web.id/api/ephoto360/effectclouds?apikey=gifted-md&text=${encodeURIComponent(text)}`;
         break;

      default:
         throw 'Command not recognized.';
   }

// Fetch the image URL from the API
try {
   const response = await fetch(apiUrl);
   const data = await response.json();

   if (data.status && data.result && data.result.imageUrl) {
      // Send the image to the user with the correct file extension
      const imageUrl = data.result.imageUrl;
      const fileExtension = imageUrl.split('.').pop(); // Extract the file extension
      conn.sendFile(m.chat, imageUrl, `logo.${fileExtension}`, `*𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 © 𝙼𝙴𝙶𝙰-𝙰𝙸*`, m);
      m.react('✅');
   } else {
      throw 'Failed to generate the image. Please try again later.';
   }
} catch (error) {
   console.error('Error fetching image:', error);
   m.reply('An error occurred while fetching the image. Please try again later.');
}
   
handler.help = [
   'mascot', 'logomaker', 'bpstyle', 'writetext', 'glossy', 'cartoon', 'pixelglitch', 'advancedglow', 
   'lighteffect', 'texteffect', 'galaxy', 'beach', 'clouds'
]
handler.tags = ['maker']
handler.command = /^(mascot|logomaker|bpstyle|pixelglitch|advancedglow|lighteffect|texteffect|galaxy|writetext|glossy|cartoon|beach|clouds)$/i

export default handler
