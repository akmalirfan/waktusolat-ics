<?php
header('Content-Type: text/plain');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// Get data
$string = file_get_contents('https://www.e-solat.gov.my/index.php?r=esolatApi/TakwimSolat&period=today&'.$_SERVER['QUERY_STRING']);
$json = json_decode($string, true);

// Process data
$masa = $json['serverTime'];
$tempat = $json['zone'];
$waktusolat = array(
    "Subuh" => $json['prayerTime'][0]['fajr'],
    "Syuruk" => $json['prayerTime'][0]['syuruk'],
    "Zuhur" => $json['prayerTime'][0]['dhuhr'],
    "Asar" => $json['prayerTime'][0]['asr'],
    "Maghrib" => $json['prayerTime'][0]['maghrib'],
    "Isyak" => $json['prayerTime'][0]['isha']
);

// Display data in ICS format
date_default_timezone_set('Asia/Kuala_Lumpur');
$date = gmdate('Ymd\THis\Z', strtotime(substr($masa, 0, 10)));
?>
BEGIN:VCALENDAR
VERSION:2.0
PRODID:https://github.com/akmalirfan/waktusolatics
X-WR-CALNAME:Waktu Solat <?= $tempat."\n" ?>
<?php foreach ($waktusolat as $ws => $val) :
if ($ws == "Imsak") continue;
$waktu = gmdate('Ymd\THis\Z', strtotime(substr($masa, 0, 10).' '.$val));
$waktuend = gmdate('Ymd\THis\Z', strtotime(substr($masa, 0, 10).' '.$val) + 1800);
// $waktuend = date('Ymd\THis\Z', strtotime(substr($masa, 0, 10).' '.$val) - 27000);
?>
BEGIN:VEVENT
UID:<?= $ws.$date."@".$_SERVER['HTTP_HOST']."\n" ?>
DTSTAMP:<?= $date."\n" ?>
DTSTART:<?= $waktu."\n" ?>
DTEND:<?= $waktuend."\n" ?>
SUMMARY:<?= $ws."\n" ?>
END:VEVENT
<?php endforeach; ?>
END:VCALENDAR