module.exports = async(req, res) => {
    const https = require('https')
    const url = `https://www.e-solat.gov.my/index.php?r=esolatApi/TakwimSolat&period=today&zone=${req.query.zone}`

    https.get(url, r => {
        r.setEncoding('utf8')
        let body = ''
        r.on('data', data => {
            body += data
        })
        r.on('end', () => {
            json = JSON.parse(body)
            res.setHeader('content-type', 'text/calendar')
            res.send(write(json))
        })
    })
}

const gmdate = dt => {
    const year = dt.getUTCFullYear()
    const month = `0${dt.getUTCMonth() + 1}`.slice(-2)
    const day = `0${dt.getUTCDate()}`.slice(-2)
    const hour = `0${dt.getUTCHours()}`.slice(-2)
    const minute = `0${dt.getUTCMinutes()}`.slice(-2)
    const second = `0${dt.getUTCSeconds()}`.slice(-2)

    return `${year}${month}${day}T${hour}${minute}${second}Z`
}

const write = json => {
    let os = require('os')
    const masa = json.serverTime
    let date = gmdate(new Date(masa.slice(0, 10) + 'GMT+8'))
    let body = `BEGIN:VCALENDAR\r\n` +
                `VERSION:2.0\r\n` +
                `PRODID:https://github.com/akmalirfan/waktusolatics\r\n` +
                `X-WR-CALNAME:Waktu Solat ${json.zone}\r\n`

    waktusolat = {
        Subuh: json.prayerTime[0].fajr,
        Syuruk: json.prayerTime[0].syuruk,
        Zuhur: json.prayerTime[0].dhuhr,
        Asar: json.prayerTime[0].asr,
        Maghrib: json.prayerTime[0].maghrib,
        Isyak: json.prayerTime[0].isha
    }

    for (const ws in waktusolat) {
        if (ws === 'Imsak') continue

        let waktu = gmdate(new Date(`${masa.slice(0, 10)} ${waktusolat[ws]} GMT+8`))
        let waktuend = gmdate(new Date(`${masa.slice(0, 10)} ${waktusolat[ws]} GMT+7`))

        body += `BEGIN:VEVENT\r\n` +
                `UID:${ws}${date}@${os.hostname()}\r\n` +
                `DTSTAMP:${date}\r\n` +
                `DTSTART:${waktu}\r\n` +
                `DTEND:${waktuend}\r\n` +
                `SUMMARY:${ws}\r\n` +
                `END:VEVENT\r\n`
    }

    body += `END:VCALENDAR`

    return body
}
