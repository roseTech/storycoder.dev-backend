#!/bin/sh

# Debian
#
# apt install ffmpeg

for DIR in *
do
    if [ ! -d "$DIR" ] # not a directory
    then
        continue
    fi

    FN_TTS="$DIR/${DIR}_Story.md.dev.tts"
    FN_WAV="$DIR/$DIR.dev.wav"
    FN_MP3="$DIR/$DIR.mp3"

    if [ -f "$FN_MP3" ] # if the mp3 files is already existing, skip to next file
    then
        continue
    fi

    echo "$DIR"

    if [ ! -f "$FN_TTS" ] # if there is no text to speak, skip to next file
    then
        echo "error, missing tts ..."
        continue
    fi

    echo "generate wav ..."
    TEXT=`cat "$FN_TTS"`
    date
    # Coqui TTS
    # Samples: http://erogol.com/ddc-samples/
    # Install: pip3 install tts
    # tts --list_models
    tts --model_name tts_models/de/thorsten/tacotron2-DCA --text "$TEXT" --out_path "$FN_WAV"
    # tts --text "$TEXT" --out_path "$FN_WAV"
    # Tortoise TTS
    # Samples: https://nonint.com/static/tortoise_v2_examples.html
    # Install: https://github.com/neonbjb/tortoise-tts
    # Notes: use venv, scipy manually, python3.8 (2023-04-19 not working with python3.10)
    #tortoise_tts.py -p ultra_fast -v angie -o "$FN_WAV" "$TEXT"
    date

    if [ ! -f "$FN_WAV" ] # if the previous step failed
    then
        echo "error, wav not generated ..."
        continue
    fi

    echo "convert mp3 ..."
    date
    ffmpeg "$FN_MP3" -i "$FN_WAV"
    date

    rm "$FN_WAV"
done
