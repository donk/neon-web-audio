//************************//
//    MAIN AUDIO CLASS    //
//************************//
class NeonAudio {
  targetSelector;
  targetEl;
  songs;
  totalSongs = 0;
  audioElement;
  waveform;
  seekPos = 0;
  isPlaying;
  audioCtx;
  analyser;
  scrubber;
  source;
  currentSong;
  volume = 0.4;
  firstRun = true;
  colors;
  showPlay;
  demoMode;
  version;
  constructor(target){
    this.version = 0.1;
    this.targetSelector = target;
    this.targetEl = document.querySelector(target);
    this.songs = [];
    this.audioElement = document.createElement('audio');
    this.isPlaying = false;
    this.colors = {
      main: '#e6ebfa',
      wave: '#CAB4BC',
      progress: '#3d3947'
    }
  }


  //*************************//
  //      PUBLIC DEALIES     //
  //*************************//

  init(showPlay = false,demoMode = false){
    this.demoMode = demoMode;
    this.showPlay = showPlay;
    // Load the theme if saved, or stick with defaults in constructor
    if (localStorage.getItem('colors')){
      let colors = JSON.parse(localStorage.getItem('colors'));
      if (colors != null){
        this.colors = colors;
      }
    }
    // Create the main audio that will play all the songs. This should be more efficient, right?
    this.targetEl.classList.add('NLAudio');
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.addEventListener('ended', (e) => {
      this.next();
    });

    this.totalSongs = this.targetEl.querySelectorAll('audio').length;
    this._populateSongs();
    this._createWaveform();
    return this;
  }
  

  play(songID = null){
    if (songID == this.currentSong) return;
    
    if (songID != null){
      let songInfo = this.songs[songID];
      let total = this.targetEl.querySelector('.total-time');
      total.innerText = this._formatTime(songInfo.duration);
      this.currentSong = songID;
      if (this.firstRun){
        this._createAudioContext();
        this._render();
        this.firstRun = false;
      }

      this._refreshColors();
      this._clearPlaying();
      this.targetEl.querySelector('.song-item[data-song-id="'+songID+'"]').classList.add('now-playing');
      this.audioElement.src = songInfo.src;
      this.audioElement.volume = this.volume;
    }

    if (!this.isPlaying){
      this.targetEl.querySelectorAll('.pause').forEach((el) => {
        el.innerHTML = icons.pause;
      });
    }

    this.audioElement.play();
    this.isPlaying = true;
    this.targetEl.classList.add('playing');
    this._refreshColors();
  }

  pause(){
    this.audioElement.pause();
    this.targetEl.querySelectorAll('.pause').forEach((el) => {
      el.innerHTML = icons.play;
    });
    this.isPlaying = false;
    this._refreshColors();
  }

  playpause(){
    if (this.isPlaying){
      this.pause();
    }else{
      this.play();
    }
    this._refreshColors();
  }

  next(){;
    if (this.currentSong < this.songs.length-1){
      this.play((this.currentSong)+1);
    }else{
      this.play(0);
    }
  }

  //*************************//
  //    SETTERS N GETTERS    //
  //*************************//

  setVolume(vol){
    this.audioElement.volume = vol;
    this.volume = vol;
  }
  getVolume(){
    return this.volume;
  }

  getColor(key){
    return this.colors[key];
  }
  setColor(key,color){
    if (typeof(key) == Object){
      this.colors = key;
    }else{
      this.colors[key] = color;
    }
    this._saveColors();
    this._refreshColors();
  }

  randomTheme(){
    // Swap through the 'themes' at the bottom. Can three colors be a theme?
    this.colors = themes[Math.floor(Math.random() * themes.length)]
    this._refreshColors();
  }
  setTheme(colors,save = true){
    this.colors = colors;
    if (save){
      this._saveColors();
    }
    this._refreshColors();
  }

  showPause(show = false){
    if (show){
      console.error('The pause button has been set to show! If this was a mistake, you can correct the problem with showPause(false) [RECOMMENDED]');
      this.targetEl.classList.remove('normal');
      this.targetEl.classList.add('abnormal');
    }else{
      this.targetEl.classList.remove('abnormal');
      this.targetEl.classList.add('normal');
    }
  }


  _hex2rgb(hex){
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  _getContrast(color){
    const [r, g, b] = Object.keys(color).map(key => {
        const channel = color[key] / 255
        return channel <= 0.03928
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4
      })
      if (parseFloat((0.2126 * r + 0.7152 * g + 0.0722 * b).toFixed(3)) > Math.sqrt(1.05 * 0.05) - 0.05){
        return('#000000');
      } else {
        return ('#ffffff');
      }
  }

  _refreshColors(){
    let scrubber = this.targetEl.querySelector('.scrubber');
    let playlist = this.targetEl.querySelector('.playlist');

    scrubber.style.backgroundColor = this.colors.wave;
    scrubber.style.color = this._getContrast(this._hex2rgb(this.colors.wave));

    playlist.style.backgroundColor = this.colors.main;
    playlist.style.color = this._getContrast(this._hex2rgb(this.colors.main));

    this.targetEl.querySelectorAll('.pause').forEach((el)=>{
      el.style.backgroundColor = this.colors.main;
      el.style.color = this._getContrast(this._hex2rgb(this.colors.main));
      el.querySelector('svg path').style.fill = el.style.color;
    });

    this.progress.style.backgroundColor = this.colors.progress;
    this.progress.style.color = this._getContrast(this._hex2rgb(this.colors.progress));

    this.progress.querySelector('.current-time').color = this._getContrast(this._hex2rgb(this.colors.progress));
    this.targetEl.querySelector('.total-time').color = this._getContrast(this._hex2rgb(this.colors.wave));
  
    // Demo only. Clean this out.
    if (this.demoMode){
      document.querySelectorAll('input[type=color]').forEach((colorPicker) => {
        let key = colorPicker.dataset.for;
        colorPicker.value = player.getColor(key);
        colorPicker.parentElement.querySelector('label').innerText = colorPicker.value;
      });
    }
  }

  _saveColors(){
    localStorage.setItem('colors',JSON.stringify(this.colors));
  }
  



  //***********************//
  //     INTERNAL BITS     //
  //***********************//

  _populateSongs(){
    /**************************************************************\
     Loop through each audio element inside the target and pull the
     duration from them, then delete.

     I think it's better to have one audio element loading only the
     media that's going to be played instead of all at once.
    /**************************************************************/
    this.targetEl.querySelectorAll('audio').forEach((el) => {
      el.addEventListener('loadedmetadata',() => {
        this.songs.push({
          src:el.src,
          title:el.getAttribute('title'),
          duration:el.duration
        });
        el.parentElement.removeChild(el);
        if (this.songs.length == this.totalSongs){
          this._createPlaylist();
        }
      });
    });
  }

  _createAudioContext(){
    // Create context that listens to audio the page is playing, and gives us the waveform datas 
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 1024; 
    this.analyser.maxDecibels = 275;
    this.analyser.smoothingTimeConstant = 0.7;
    this.source = this.audioCtx.createMediaElementSource(this.audioElement);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);
  }

  _createScrubber(parent){
    let scrubber = document.createElement('div');
    scrubber.classList.add('scrubber');
    scrubber.style.backgroundColor = this.colors.wave;

    let curTime = document.createElement('div');
    curTime.classList.add('current-time');

    let curTimeUnder = document.createElement('div');
    curTimeUnder.classList.add('current-time');
    curTimeUnder.style.float = "left";

    let totTime = document.createElement('div');
    totTime.classList.add('total-time');
    totTime.innerHTML = "&nbsp;";

    let progress = document.createElement('div');
    progress.classList.add('progress');
    progress.style.backgroundColor = this.colors.progress;
    this.progress = progress;

    progress.appendChild(curTime);
    scrubber.appendChild(curTimeUnder);
    scrubber.appendChild(progress);
    scrubber.appendChild(totTime);
    
    parent.appendChild(scrubber);
  }

  _createPlaylist(){
    let container = document.createElement('div');
    container.style.display = "flex";

    let playlist = document.createElement('ul');
    playlist.classList.add('playlist');
    playlist.style.backgroundColor = this.colors.main;

    this.songs.forEach((song,index) => {
      let songItem = document.createElement('li');
      songItem.classList.add('song-item');
      songItem.dataset.songId = index;
      this._addSongListener(songItem);

      let title = document.createElement('span');
      title.classList.add('song-title');
      title.innerText = song.title;

      let duration = document.createElement('span');
      duration.classList.add('song-duration');
      duration.innerText = this._formatTime(song.duration);

      let pauser = document.createElement('div'); // pfffft 
      pauser.classList.add('pause');
      pauser.innerHTML = icons.pause;
      pauser.style.backgroundColor = this.colors.main;
      pauser.addEventListener('click',(e) => {
        this.playpause();
      })
      
      if (this.showPlay){
        this.targetEl.classList.add('abnormal');
      }else{
        this.targetEl.classList.add('normal');
      }

      songItem.appendChild(pauser);
      songItem.appendChild(duration);
      songItem.appendChild(title);
      playlist.appendChild(songItem);
    });

    let controls = document.createElement('div');
    controls.classList.add('controls');
    
    let volume = document.createElement('input');
    volume.type = "range";
    volume.min = 0;
    volume.max = 1;
    volume.step = 0.05;
    volume.value = this.volume;
    volume.addEventListener('change',(e)=>{
      this.setVolume(e.target.value);
      if (e.target.value == 0){
        this.pause();
      }else{
        if (!this.isPlaying) this.play();
      }
    });

    // It would be very cool if you kept this, but I won't cry if you don't <3
    let watermarkOrWhateverYoudCallThis = document.createElement('div');
    watermarkOrWhateverYoudCallThis.style.float = "right";
    watermarkOrWhateverYoudCallThis.style.opacity = 0.3;
    watermarkOrWhateverYoudCallThis.style.fontSize = '0.6em';
    watermarkOrWhateverYoudCallThis.innerHTML = 'NLAudio v'+this.version+' - <a target="_blank" style="color:inherit;text-decoration:none;"href="https://www.notlikely.me">www.notlikely.me</a>';

    controls.appendChild(volume);
    controls.appendChild(watermarkOrWhateverYoudCallThis);
    playlist.appendChild(controls);

    this.targetEl.appendChild(playlist);

    this._refreshColors();
    
  }

  _addSongListener(el){
    el.addEventListener('click',(e) => {
      if (!e.target.classList.contains('song-item')) return;
      this._clearPlaying();
      this.play(parseInt(e.target.dataset.songId));
    });
  }

  _clearPlaying(){
    let playing = document.querySelector('.NLAudio ul.playlist li.now-playing');
    if (playing) playing.classList.remove('now-playing');
  }
  
  _formatTime(seconds){
    var pad = function(num, size) { return ('000' + num).slice(size * -1); },
    time = parseFloat(seconds).toFixed(3),
    minutes = Math.floor(time / 60) % 60,
    sec= Math.floor(time - minutes * 60)

    return pad(minutes, 2) + ':' + pad(sec, 2);
  }



       //\          /\
      //*\\  /\    //\\
    //*******************\/\___
  //******WAVEFORM STUFFS******\ 
//****************************** \
  _createWaveform(){
    let topFrame = document.createElement('div');
    topFrame.style.display = 'flex';

    let container = document.createElement('div');
    container.classList.add('seeker');
    let canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 100;
    this.canvas = canvas;
    this._addCanvasListeners();
    container.appendChild(canvas);
    this._createScrubber(container);
    topFrame.appendChild(container);
    this.targetEl.appendChild(topFrame);
  }

  _addCanvasListeners(){
    this.canvas.addEventListener('mousemove',(e) => {
      if (!this.isPlaying){ return; }
      if(e.type == "touchstart") return;
      let clientRect = this.canvas.getBoundingClientRect();
      let scaleX = this.canvas.width / clientRect.width;
      this.seekPos = (e.clientX - clientRect.left)*scaleX;
      this.targetEl.querySelectorAll('.current-time').forEach((el)=>{
        el.style.left = e.clientX - clientRect.left - el.offsetWidth /1.5 ;
        let time = this._formatTime(this.seekPos / this.canvas.width * this.songs[this.currentSong].duration);
        if (time != el.innerText ){
          el.innerText = time;
        }
      }); 
      if(!this.targetEl.classList.contains('seeking')){
        this.targetEl.classList.add('seeking');
      }
    });
    this.canvas.addEventListener('click',(e) => {
      if (this.isPlaying){
        let clientRect = this.canvas.getBoundingClientRect();
        let scaleX = this.canvas.width / clientRect.width;
        let clickPos = (e.clientX - clientRect.left)*scaleX;
        let seekPos = clickPos / this.canvas.width;
        this.audioElement.currentTime = seekPos * this.songs[this.currentSong].duration;
      }
    });
    this.canvas.addEventListener('mouseout',() => {
      this.seekPos = 0;
      this.targetEl.classList.remove('seeking');
    });
    this.canvas.addEventListener('touchend',() => {
      this.seekPos = 0;
      this.targetEl.classList.remove('seeking');
    });
  }

  _render(){
    let array = new Uint8Array(this.analyser.frequencyBinCount);
    let ctx = this.canvas.getContext('2d');
    let curtime = this.audioElement.currentTime;
    let curpos = curtime / this.songs[this.currentSong].duration * 100;
    this.analyser.getByteFrequencyData(array);
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    ctx.font = '48px arial';
    // background
    ctx.fillStyle = this.colors.wave;
    ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    //progress
    ctx.fillStyle = this.colors.progress;
    ctx.fillRect(0,0,this.canvas.width/100*curpos,200);
    this.progress.style.width = curpos+"%";
    
    if (!this.targetEl.classList.contains('seeking')){
      this.targetEl.querySelectorAll('.current-time').forEach((el)=>{
        el.innerText = this._formatTime(curtime);
      });
    }

    for(let o=0; o<array.length/2; o++){
      let section_size = (this.canvas.width/150);
      ctx.clearRect(o*section_size, 0,section_size+2,this.canvas.height - array[o]*2);
    }
    
    // Draw seek line thingy
    if (this.seekPos > 0){
      ctx.fillStyle="rgba(0,0,100,0.4)";
      ctx.fillRect(this.seekPos,this.canvas.height/1.2,2,this.canvas.height/4);
    }
       
    window.requestAnimationFrame(()=>this._render());
  }

}

var icons = {
  play: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">
  <path fill="rgba(255,255,255,1)" d="M3 2l10 6-10 6z"></path>
  </svg>`,
  pause:`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">
  <path fill="rgba(255,255,255,1)" d="M2 2h5v12h-5zM9 2h5v12h-5z"></path>
  </svg>`
}

var themes =  [
  {name:"green",main:'#dcf8f7',wave:'#296569',progress:'#2fd7a0'},
  {name:"blue",main:'#f5f5f5',wave:'#7eb6ce',progress:'#7b6aa4'},
  {name:"pastel",main:'#fdf2f5',wave:'#adbdcb',progress:'#f1f3c5'},
  {name:"charcoal",main:'#6b647b',wave:'#a7abb6',progress:'#e7ebed'},
  {name:"melon",main:'#1b7668',wave:'#ee8a94',progress:'#b76a7d'},
  {name:"pacer",main:'#f5f7f4',wave:'#f2f4a6',progress:'#a094be'},
  {name:"doesntmatteranymore",main: '#f4d6fe', wave: '#97419e', progress: '#efa314'},
  {name:'a',main: '#69686a', wave: '#f5ec74', progress: '#151f0c'}
]
// Thanks for looking through the file; I love you.