const axios = require('axios')
let token = "";
let refreshToken = ""
const {simply_book} = require('../config.json')

const getNewToken = async () => {
    try{
        const body = {
            company: simply_book.name,
            ...refreshToken && {
                refresh_token : refreshToken
            },
            ...!refreshToken && {
                login : simply_book.user,
                password : simply_book.password
            }
        }

        const res = await axios.post(`${simply_book.api_base_url}/admin/auth${refreshToken && '/refresh-token'}`, body)

        refreshToken = res.data.refresh_token;
        token = res.data.token;

    } catch(e) { console.log(e) }
}

const getTutorByBookingCode = async (id) => {
    try{
        if(!token) await getNewToken()

        const res = await axios.get(`${simply_book.api_base_url}/admin/bookings?filter[search]=` + id, {
            headers: {
                'Content-Type': 'application/json',
                'X-Company-Login': simply_book.name,
                'X-Token': token
            }
        });

        return res.data.data[0].provider;
    } catch (e) {
        const status = e.response.status;
        if(status === 401) {
            await getNewToken()
            return getTutorByBookingCode(id)
        } else {
            console.log(`Error! Status ${status}.`)
            return null;
        }
    }
}

// async function test(){
//     console.log(await getTutorByBookingCode(2))
// }
//
// test()

module.exports = {getTutorByBookingCode}
