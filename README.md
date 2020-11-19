# Neon Audio Player
Super minimal, super hip, super easy peasy to use.

Demo and the same infos as here: https://donk.github.io/neon-web-audio/

## What's this?
Neon Player is a lightweight library using vanilla javascript and css to make it easy to embed music on your website. The minimal design lets it fit in a wide range of sizes and color schemes, and that's why it's so basic and not because I have a very bland eye for design.

There's not meant to be a pause button, since volume sliders are pretty good at making sound stop. When the volume is turned all the way down the song pauses. There is a play/pause button available, but I couldn't find a good way to implement it and keep things super boring and square. I highly recommend against using this, and regret mentioning it in the first place.

## How to use
First you need to include the library in the ```<head>```. You can get the source from Github, or use my 'CDN' with the minified versions. (Is this a bad idea? Probably, but my host says unlimted bandwidth, so.). 
```
<head>
  <link rel="stylesheet" href="https://neon.pw/nl-audio.min.css">
  <script type="text/javascript" src="https://neon.pw/nl-audio.min.js"></script>
</head>
```
Create a div with ```<audio>``` elements of your musics inside. 
```
<div id="playlist">
  <audio src="https://neon.pw/lofi.mp3" title="The Most Generic Lofi Song Ever"></audio>
  <audio src="https://neon.pw/splash.wav" title="Drink More Water"></audio>
</div>
```
Then create a new instance of NeonAudio and pass the selector for the element you created
```let player = new NeonAudio('#playlist');```
To actually create the player, you need to call initialize it. Pass true if you want a not so pretty pause button
``` 
player.init();
// Or just: new NeonAudio('#playlist').init();
```

### Most basic example
Copy/Paste this into an html file and you've got yourself a music player!
```
<html>
  <head>
    <title>Me, the famous music person</title>
    <link rel="stylesheet" href="https://neon.pw/nl-audio.min.css">
    <script type="text/javascript" src="https://neon.pw/nl-audio.min.js"></script>
  </head>
  <body>
    <div id="my-super-good-songs" style="max-width:600px;margin:200px auto;">
      <!-- Replace the information in these audo tags with your own mp3/ogg/wav -->
      <audio src="https://neon.pw/lofi.mp3" title="The Most Generic Lofi Song Ever"></audio>
      <audio src="https://neon.pw/splash.wav" title="Drink More Water"></audio>
    </div>
    
    <script>
      let player = new NeonAudio('#my-super-good-songs').init(false);
      // Change init(false) to init(true) if you want a pause button (ew)
    </script>
  </body>
</html>
```


# Nitty Gritties
This library is pretty light at 22kb or 15kb minified, using regular ol' javascript. It has some public functions, with more planned for the future. Those functions are:

**NeonAudio.init(bool|showPlay)**  
This kicks everything off, and needs to be called pretty much immediately. Never pass true to this function.


**NeonAudio.play(int|songID)**  
When a number is passed, it'll try to play the song based on position in the playlist. If nothing's passed, it resumes playing.


**NeonAudio.pause()**  
Pauses as you'd expect. This is triggered when the volume is set to 0.


**NeonAudio.playpause()**  
Mixing things up. This toggles play and pause, for a certain button that shouldn't be enabled.


**NeonAudio.next()**  
Plays the next song. I should probably make a prev() too.


**NeonAudio.getVolume()**  
**NeonAudio.setVolume(float|volume)**  
Get or set the volume; Accepts a value between 0 and 1


**NeonAudio.getColor(string|key)**  
**NeonAudio.setColor(string|key, string|color)**  
Get or set the color of a specific element. There are currently only 3 elements: "main", "wave", and "progress".
- main is the background color for the playlist
- wave is the background color of the waveform/frequency bar thing
- progress is the color of the progress bar overlay
setColor accepts any css-valid color value.


**NeonAudio.setColor(object|colors)**  
You can also set the color by passing an object with the above keys paired with a color string
eg. ```{main:'#eee',wave:'#444',progress:'#aaa'}```


**NeonAudio.showPause(bool|false)**  
If you reallly feel like breaking away from the *a e s t h e t i c* you can pass true to this.

