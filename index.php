<?php
header('Content-Type: text/plain');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$xml = simplexml_load_file('http://www2.e-solat.gov.my/xml/today/?'.$_SERVER['QUERY_STRING']);
$masa = (string) $xml->channel->children('http://purl.org/dc/elements/1.1/')->date;
$tempat = (string) $xml->channel->link;
$waktusolat = array();

foreach ($xml->channel->item as $item) {
    $waktusolat[(string) $item->title] = (string) $item->description;
}

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