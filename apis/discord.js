const axios = require('axios')
const {discord_api, simply_book} = require('../config.json')

/**
 * Sends a webhook message to the designated channel.
 * @param {string} title Title of the embed, showed in bold.
 * @param {string} description Description of the embed.
 * @param {string='000000'} color Hex code of the embed, leave blank for black.
 * @param {array=null} fields Optional fields inside the embedded message
 * @param {string=null} thumbnail_url Optional URL of thumbnail to display.
 */
async function sendDiscordMessage(title, description, color, fields, thumbnail_url){
    try{
        await axios.post(discord_api.webhook_link, {
            username: discord_api.webhook_user_name,
            avatar_url: discord_api.webhook_user_picture,
            embeds: [
                {
                    title: title,
                    thumbnail: {url: thumbnail_url,},
                    timestamp: new Date(),
                    color: color ? parseInt(color, 16) : 0,
                    description: description,
                    author: {
                        name: discord_api.webhook_user_name,
                        icon_url: discord_api.webhook_user_picture
                    },
                    fields: fields
                }
            ],
        })
    } catch (e) {
        console.log(e)
    }
}

/**
 * Sends a discord webhook when a payment has been handled.
 *
 * @param {string} booking_code Booking Code
 * @param {object} price_data Pricing Data including tutor_pay, commission and amount.
 * @param {object} tutor_data Tutor Data including tutor name and id.
 */
async function paymentHandled(booking_code, price_data, tutor_data){
    await sendDiscordMessage(`Booking \`\`\`${booking_code}\`\`\` Confirmed!`, `The tutor has been transferred ${price_data.tutor_pay} AUD.`, `00FF00`, [
        {
            name: `Tutor: ${tutor_data.name}`,
            value: `SimplyBook ID: ${tutor_data.id}`
        },
        {
            name: "Novicate Commission (GST Included)",
            value: `${price_data.commission} AUD`,
        },
        {
            name: "Amount Received",
            value: `${price_data.amount} AUD`,
            inline: true
        },
        {
            name: "GST",
            value: `${price_data.gst} AUD`,
            inline: true
        },
        {
            name: "Tutor Pay",
            value: `${price_data.tutor_pay} AUD`,
            inline: true
        },

    ],
    tutor_data.picture_preview ?
        `${simply_book.booking_website_url}/${tutor_data.picture_preview}`
        : "https://cdn.discordapp.com/embed/avatars/1.png"
    )
}

module.exports = {sendDiscordMessage, paymentHandled}

