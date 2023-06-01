#!/bin/sh

# Debian
#
# apt install ffmpeg

# Coqui TTS
# Samples: http://erogol.com/ddc-samples/
# Install: pip3 install tts
#
# Ca. 10 minutes for a single story. Sometimes has problems and mumbles for
# several minutes until getting back on track. Maybe it is necessary to prepare
# stories somewhat better and rip out everything which may lead to issue
# (numbers, code, ...).

# Tortoise TTS
# Samples: https://nonint.com/static/tortoise_v2_examples.html
# Install: https://github.com/neonbjb/tortoise-tts
#
# Installing the dependencies was not working as described (dependencies may
# have changed since the the author updated the code). Following steps were
# done: Use Python 3.8 (2023-04-19 not working with Python 3.10), venv was used
# (especially good for the install step), scipy had to added manually as the
# version described does not work anymore.
#
# A single story takes ca. 2 hours to encode with the ultra_fast preset. Maybe
# someone else finds faster library which is still as good.

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
    tts --text "$TEXT" --out_path "$FN_WAV"
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
