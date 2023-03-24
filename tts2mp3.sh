#!/bin/sh

# Debian
#
# apt install ffmpeg

for DIR in *
do
    echo "$DIR"
    FN_TTS="$DIR/${DIR}_Story.md.dev.tts"
    FN_WAV="$DIR/$DIR.dev.wav"
    FN_MP3="$DIR/$DIR.mp3"
    if [ ! -f "$FN_TTS" ] # if there is no text to speak, skip to next file
    then
        echo "skip ..."
        continue
    fi
    if [ -f "$FN_MP3" ] # if the mp3 files is already existing, skip to next file
    then
        echo "skip ..."
        continue
    fi
    echo "generate wav ..."
    TEXT=`cat "$FN_TTS"`
    date
    
    # Coqui TTS
    # Samples: http://erogol.com/ddc-samples/
    # Install: pip3 install tts
    tts --text "$TEXT" --out_path "$FN_WAV"

    # Tortoise TTS
    # Samples: https://nonint.com/static/tortoise_v2_examples.html
    # tortoise_tts.py -v angie -o "$FN_WAV" "$TEXT"
    
    date
    echo "convert mp3 ..."
    ffmpeg "$FN_MP3" -i "$FN_WAV"
    rm "$FN_WAV"
done
