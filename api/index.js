module.exports = async(req, res) => {
    const https = require('https')
    const url = `https://www.e-solat.gov.my/index.php?r=esolatApi/TakwimSolat&period=week&zone=${req.query.zone}`

    https.get(url, r => {
        r.setEncoding('utf8')
        let body = ''
        r.on('data', data => {
            body += data
        })
        r.on('end', () => {
            json = JSON.parse(body)
            res.setHeader('content-type', 'text/calendar')
            res.send(write(json, req.query.days))
        })
    })
}

const bulan = {
    Jan: 1,
    Feb: 2,
    Mac: 3,
    Apr: 4,
    Mei: 5,
    Jun: 6,
    Jul: 7,
    Ogo: 8,
    Sep: 9,
    Okt: 10,
    Nov: 11,
    Dis: 12
}

const getBulan = b => `0${bulan[b.slice(0, 3)]}`.slice(-2)

const month2Num = month => month.replace(/[A-Za-z]+/, getBulan)

const date2Ymd = date => `${date.slice(-4)}-${date.slice(-7, -5)}-${date.slice(0, 2)}`

const gmdate = dt => {
    const year = dt.getUTCFullYear()
    const month = `0${dt.getUTCMonth() + 1}`.slice(-2)
    const day = `0${dt.getUTCDate()}`.slice(-2)
    const hour = `0${dt.getUTCHours()}`.slice(-2)
    const minute = `0${dt.getUTCMinutes()}`.slice(-2)
    const second = `0${dt.getUTCSeconds()}`.slice(-2)

    return `${year}${month}${day}T${hour}${minute}${second}Z`
}

const write = (json, days = 1) => {
    let os = require('os')
    let body = `BEGIN:VCALENDAR\r\n` +
                `VERSION:2.0\r\n` +
                `PRODID:https://github.com/akmalirfan/waktusolatics\r\n` +
                `X-WR-CALNAME:Waktu Solat ${json.zone}\r\n`

    let waktusolat = {
        Subuh: 'fajr',
        Syuruk: 'syuruk',
        Zuhur: 'dhuhr',
        Asar: 'asr',
        Maghrib: 'maghrib',
        Isyak: 'isha'
    }

    // Hadkan kepada tujuh hari
    if (days > 7) days = 7

    for (let i = 0; i < days; i++) {
        for (const ws in waktusolat) {
            let tarikh = date2Ymd(month2Num(json.prayerTime[i].date))
            let date = gmdate(new Date(tarikh + 'GMT+8'))
            let waktu = gmdate(new Date(`${tarikh} ${json.prayerTime[i][waktusolat[ws]]} GMT+8`))
            let waktuend = gmdate(new Date(`${tarikh} ${json.prayerTime[i][waktusolat[ws]]} GMT+7`))

            body += `BEGIN:VEVENT\r\n` +
                    `UID:${ws}${date}@${os.hostname()}\r\n` +
                    `DTSTAMP:${date}\r\n` +
                    `DTSTART:${waktu}\r\n` +
                    `DTEND:${waktuend}\r\n` +
                    `SUMMARY:${ws}\r\n` +
                    `END:VEVENT\r\n`
        }
    }

    body += `END:VCALENDAR`

    return body
}
