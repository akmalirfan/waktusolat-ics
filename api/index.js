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
            res.send(write(json))
        })
    })
}

const gmdate = dt => {
    const dateTimeFormat = new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
    const [{ value: month },,{ value: day },,{ value: year },,{ value: hour },,{ value: minute },,{ value: second }] = dateTimeFormat.formatToParts(dt)

    // return `${year}${month}${day}T${hour}${minute}${second}Z`
    return `${dt.getUTCFullYear()}${("0" + (dt.getUTCMonth() + 1)).slice(-2)}${("0" + dt.getUTCDate()).slice(-2)}T${("0" + dt.getUTCHours()).slice(-2)}${("0" + dt.getUTCMinutes()).slice(-2)}${("0" + dt.getUTCSeconds()).slice(-2)}Z`
}

const write = json => {
    let os = require('os')
    const masa = json.serverTime
    let date = gmdate(new Date(masa.slice(0, 10) + 'GMT+8'))
    let body = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:https://github.com/akmalirfan/waktusolatics
X-WR-CALNAME:Waktu Solat ${json.zone}
`

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

        body += `BEGIN:VEVENT
UID:${ws}${date}@${os.hostname()}
DTSTAMP:${date}
DTSTART:${waktu}
DTEND:${waktuend}
SUMMARY:${ws}
END:VEVENT
`
    }

    body += `END:VCALENDAR`

    return body
}
