#!/bin/sh

for DIR in *
do
    FN_TTSTXT="$DIR/${DIR}_Story.md.dev.txt"
    FN_WAV="$DIR/$DIR.dev.wav"
    FN_MP3="$DIR/$DIR.mp3"
    if [ ! -f "$FN_TTSTXT" ] # if there is no text to speak, continue
    then
        continue
    fi
    if [ -f "$FN_MP3" ] # if the mp3 files is already existing, continue
    then
        continue
    fi
    echo "$DIR"
    TEXT=`cat "$FN_TTSTXT"`
    tts --text "$TEXT" --out_path "$FN_WAV"
    ffmpeg "$FN_MP3" -i "$FN_WAV"
    rm "$FN_WAV"
done
