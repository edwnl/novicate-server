const axios = require('axios')
const {discord_api} = require('../config.json')

/**
 * Sends a webhook message to the designated channel.
 * @param {string} title Title of the embed, showed in bold.
 * @param {string} message Content of the embed.
 * @param {string} color Hex code of the embed, leave blank for black.
 * @param {array} fields Fields inside the embedded message
 */
async function sendDiscordMessage(title, message, color, fields, thumbnail_url){
    const convertedMessage = message.toString().replaceAll(',', '\n')
    console.log(thumbnail_url)
    try{
        await axios.post(discord_api.webhook_link, {
            username: "Novicate Server",
            avatar_url: "https://i.imgur.com/PsMrfTv.jpg",
            embeds: [
                {
                    title: title,
                    thumbnail: {
                        url: thumbnail_url,
                    },
                    timestamp: new Date(),
                    color: color ? parseInt(color, 16) : 0,
                    description: convertedMessage,
                    author: {
                        name: "Novicate",
                        icon_url: "https://i.imgur.com/PsMrfTv.jpg"
                    },
                    fields: fields
                }
            ],
        })
    } catch (e) {
        console.log(e)
    }
}

async function chargeHandled(booking_code, price_data, tutor_data){
    await sendDiscordMessage(`Booking \`\`\`${booking_code}\`\`\` Confirmed!`, `The tutor has been transferred ${price_data.tutor_pay} AUD.`, `00FF00`, [
        {
            name: `Tutor: ${tutor_data.name}`,
            value: `SimplyBook ID: ${tutor_data.id} \n Stripe ID: ${tutor_data.stripe_account}`
        },
        {
            name: "Novicate Commission",
            value: `${price_data.commission} AUD`,
        },
        {
            name: "Net Price",
            value: `${price_data.amount} AUD`,
            inline: true
        },
        {
            name: "Tutor Pay",
            value: `${price_data.tutor_pay} AUD`,
            inline: true
        }
    ],
    tutor_data.picture_preview ?
        `https://novicate.simplybook.me/${tutor_data.picture_preview}`
        : "https://cdn.discordapp.com/embed/avatars/1.png"
    )
}

module.exports = {sendDiscordMessage, chargeHandled}

