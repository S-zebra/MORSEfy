window.addEventListener("load", function (e){
  document.getElementById("morsefybtn").addEventListener("click", sound, false);
  prepareOscillator();
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

//1桁あたりのOnの長さ
var lengths={ "s": 50 };
lengths["l"]=lengths["s"]*3; //lはsの3倍分の長さ

var freq=750;
//音の区切り
var len_note_stop=lengths["s"];
//文字区切り
var len_char_stop=lengths["s"]*3;
//語の区切り
var len_word_stop=lengths["s"]*7;
//音声ミックス先
var audioCtx, dest;

var char_pos=0;
var char, text;

function sound(){
  text=document.getElementById("inputbox").value.toUpperCase().replace(/\n/g, " ").replace(/[^0-9A-Z\.,\?!\-\/\@\(\)\x20\t]/g,"");
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
  var morse_c=MORSE_EN[char];
  for(var i=0;i<morse_c.length;i++){
    len_per_char+=lengths[morse_c.charAt(i)]+len_note_stop;
  }

  beep_single_char(char);

  if(char_pos>=1){
    show_before_char(text.charAt(char_pos-1));
  }
  if(char_pos<text.length){
    show_after_char(text.charAt(char_pos+1));
  }
  if(char_pos<text.length-1){
    char_pos++;
    setTimeout(beep_text, len_per_char+len_char_stop);　//通常
  }
}

var note_pos=0;
var curnote;
var morse;

function beep_single_char(char) {
  note_pos=0;
  morse=MORSE_EN[char];
  curnote=morse.charAt(note_pos); //現在の1ノート
  show_char(char, morse.replace(/s/g,"・").replace(/l/g, "―"));
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
  stoptime=(time/1000)+audioCtx.currentTime;
  osc.stop(stoptime);
}

function prepareOscillator(){
  audioCtx = new window.webkitAudioContext();
  dest = audioCtx.destination;
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