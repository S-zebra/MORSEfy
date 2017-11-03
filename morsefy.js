var spdUnitBox, spdValBar, spdLabel;
var radio_en, radio_jp;
var light_box;

window.addEventListener("load", function (e){
  document.getElementById("morsefybtn").addEventListener("click", sound, false);

  radio_en=document.getElementById("radio-en");
  radio_jp=document.getElementById("radio-jp");
  light_box=document.getElementById("light");
  radio_en.addEventListener("change", changeLanguage, false);
  radio_jp.addEventListener("change", changeLanguage, false);

  prepareOscillator();
  calcSpeed("wpm", 30);
},false);

var MORSE_EN={
"0":"lllll",  "1":"sllll",  "2":"sslll",  "3":"sssll",  "4":"ssssl",
"5":"sssss",  "6":"lssss",  "7":"llsss",  "8":"lllss",  "9":"lllls",
"A":"sl",     "B":"lsss",   "C":"lsls",   "D":"lss",    "E":"s",
"F":"ssls",   "G":"lls",    "H":"ssss",   "I":"ss",     "J":"slll",
"K":"lsl",    "L":"slss",   "M":"ll",     "N":"ls",     "O":"lll",
"P":"slls",   "Q":"llsl",   "R":"sls",    "S":"sss",    "T":"l",
"U":"ssl",    "V":"sssl",   "W":"sll",    "X":"lssl",   "Y":"lsll", "Z":"llss",
".":"slslsl", ",":"llssll", "?":"ssllss", "!":"lslsll", "-":"lssssl", "/":"lssls",
"@":"sllsls", "(":"lslls",  ")": "lsllsl"
};

var MORSE_JP={
"0":"lllll",  "1":"sllll",  "2":"sslll",  "3":"sssll",  "4":"ssssl",
"5":"sssss",  "6":"lssss",  "7":"llsss",  "8":"lllss",  "9":"lllls",
"い": "sl",    "ろ": "slsl",  "は": "lsss",  "に": "lsls",
"ほ": "lss",   "へ": "s",     "と": "sslss", "ち": "ssls",
"り": "lls",   "ぬ": "ssss",  "る": "lslls", "を": "slll",
"わ": "lsl",   "か": "slss",  "よ": "ll",    "た": "ls",
"れ": "lll",   "そ": "lls",   "つ": "slls",  "ね": "llsl",
"な": "sls",   "ら": "sss",   "む": "l",     "う": "ssl",
"ゐ": "slssl", "の": "ssll",  "お": "slsss", "く": "sssl",
"や": "sll",   "ま": "lssl",  "け": "lsll",  "ふ": "llss",
"こ": "llll",  "え": "lslll", "て": "slsll", "あ": "llsll",
"さ": "lslsl", "き": "lslss", "ゆ": "lssll", "め": "lsssl",
"み": "sslsl", "し": "llsls", "ゑ": "sllss", "ひ": "llssl",
"も": "lssls", "せ": "sllls", "す": "lllsl", "ん": "slsls",
"゛": "ss",    "゜": "sslls", "ー": "sllsl", "、": "slslsl",
"\n": "slslss", 
"（": "lsllsl", "）": "slssls",
"(": "lsllsl",  ")": "slssls"
};

//速度たち
var lengths={};
var len_note_stop, len_char_stop, len_word_stop;

var freq=750;

//音声ミックス先
var audioCtx, dest;

var char_pos=0;
var char, text;
var jp_mode=false;

function calcSpeed(mode, value) {
  /*
    WPM: 1分に50短点が何回出るか？
    1分=60,000ms
    WPM=30だとして
    60000/(50 x value);
    =30WPMだと40msとなる

    60000/(50v);
    X=v*600000*50;
    CPM: WPM*5
  */
  lengths["s"]=60000/(50*value);
  if(mode=="cpm"){
    lengths["s"]/=5;
  }
  lengths["l"]=lengths["s"]*3; //lはsの3倍分の長さ
  //音の区切り
  len_note_stop=lengths["s"];
  //文字区切り
  len_char_stop=lengths["s"]*3;
  //語の区切り
  len_word_stop=lengths["s"]*7;
}

function sanitize(text) {
  if(jp_mode){
    return text.replace(/[ァ-ン]/g, toHiragana)
    .replace(/[ぁぃぅぇぉっゃゅょ]/g, rshift_one)
    .replace(/。/g, "\n")
    .replace(/[^0-9ぁ-んー\n\s、()（）]/g, "")
    .replace(/[がぎぐげござじずぜぞだぢづでどばびぶべぼ]/g, removeSonant)
    .replace(/[ぱぴぷぺぽ]/g, removeSemiSonant);
  }else{
    return text.toUpperCase()
    .replace(/\n/g, " ")
    .replace(/[^0-9A-Z\.,\?!\-\/\@\(\)\x20\t]/g,"");
  }
}
function toHiragana(c) {
  return String.fromCharCode(c.charCodeAt(0)-0x60); 
}
function removeSonant(c) {
  return String.fromCharCode(c.charCodeAt(0)-1)+"゛";
}
function removeSemiSonant(c){
  return String.fromCharCode(c.charCodeAt(0)-2)+"゜";
}
function rshift_one(c){
  return String.fromCharCode(c.charCodeAt(0)+1);
}

function sound(){
  text=document.getElementById("inputbox").value;
  text=sanitize(text);
  char_pos=0;
  beep_text();
}

//これが1文字分
function beep_text() {
  char=text.charAt(char_pos);
  if(char==" "){
    char_pos++;
    setTimeout(beep_text, len_word_stop); //語間を空ける
    return;
  }
  //len_per_charを計算
  var len_per_char=0;
  var morse_c;
  if(jp_mode){
    morse_c=MORSE_JP[char];
  }else{
    morse_c=MORSE_EN[char];
  }
  for(var i=0;i<morse_c.length;i++){
    len_per_char+=lengths[morse_c.charAt(i)]+len_note_stop;
  }

  beep_single_char(char);

  if(char_pos>=1){
    show_before_char(text.charAt(char_pos-1));
  }
  if(char_pos<text.length-1){
    show_after_char(text.charAt(char_pos+1));
    char_pos++;
    setTimeout(beep_text, len_per_char+len_char_stop);　//通常
  }
}

var note_pos=0;
var curnote;
var morse;

function beep_single_char(char) {
  note_pos=0;
  if(jp_mode){
    morse=MORSE_JP[char];
  }else{
    morse=MORSE_EN[char];
  }
  curnote=morse.charAt(note_pos); //現在の1ノート
  show_char(char.replace(/\n/,"」"), morse.replace(/s/g,"・").replace(/l/g, "―"));
  beep_single_note();
}

function beep_single_note(){
  curnote=morse.charAt(note_pos);
  beep(freq, lengths[curnote]);
  if (note_pos<morse.length-1) {
    note_pos++;
    setTimeout(beep_single_note, lengths[curnote]+len_note_stop);
  }
}

function beep(freq, time){
  var osc=audioCtx.createOscillator();
  var stoptime;
  osc.type="sine";
  osc.frequency.value=freq;
  osc.connect(dest);
  osc.start();
  light.style.backgroundColor="#000";
  setTimeout(recoverLight, time);
  stoptime=(time/1000)+audioCtx.currentTime;
  osc.stop(stoptime);
}
function recoverLight() {
  light.style.backgroundColor="#fff";
}
function prepareOscillator(){
  audioCtx = new window.webkitAudioContext();
  dest = audioCtx.destination;
}
function changeLanguage(e) {
  if(e.srcElement.value=="jp"){
    jp_mode=true;
  }else{
    jp_mode=false;
  }
}

function show_char(char, char_num) {
  document.getElementById("curchar").innerText=char;
  document.getElementById("curcharnumbox").innerText="("+char_num +")";
}
function show_before_char(char) {
  document.getElementById("beforechar").innerText=char;
}
function show_after_char(char) {
  document.getElementById("afterchar").innerText=char;
}

function show_freqs(freqs_text){
  document.getElementById("curfreqbox").innerText=freqs_text;
}

function dispLog(txt){
  document.getElementById("debug").innerText+=txt+"\n";
}