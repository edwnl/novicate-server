const extractBookingCode = (s) => {
    const startRegex = /^[^,]*, /;
    const endRegex = /\)(.*)/;
    s = s.replace(startRegex, '')
    s = s.replace(endRegex, '')
    return s;
}

const l = (s) => {
    const date = new Date;
    const timeStmp = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    console.log(`[Novicate-Server ${timeStmp}] ${s}`)
}

const isEmpty = (object) => {
    for(const i in object) return false
    return true
}

const round = (num) => {
    return Math.round(num * 100) / 100
}

module.exports = {extractBookingCode, l, isEmpty, round}