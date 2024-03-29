import fs from 'fs';
import path from 'path';

import * as wp from './wp.js';
import * as story from './story.js';
import * as functions from './functions.js';

const { STORIES_ROOT } = process.env; // the path were the stories are

function mediaRead(fileName) {
  const content = fs.readFileSync(fileName);
  const title = functions.checksum(content);
  const link = title + path.extname(fileName);
  return {
    fileName,
    title,
    link,
    content
  };
}

// go through all stories in the repository a create HTML out of it. This HTML
// later can be used to upload to WordPress.
function repoStoriesList() {
  return fs
    .readdirSync(STORIES_ROOT)
    .map((folder) => {
      if (folder.startsWith('.') || fs.lstatSync(path.join(STORIES_ROOT, folder)).isFile()) {
        return undefined;
      }
      const storyFileName = path.join(STORIES_ROOT, folder, `${folder}_Story.md`);
      if (!fs.existsSync(storyFileName)) {
        console.error('Missing Story:', folder);
        return undefined;
      }
      const storyText = fs.readFileSync(storyFileName, 'utf-8');
      const ttsText = story.toTtsText(storyText);
      fs.writeFileSync(`${storyFileName}.dev.tts`, ttsText);

      const logoImageFileNameJPG = path.join(STORIES_ROOT, folder, `${folder}.jpg`);
      const logoImageFileNamePNG = path.join(STORIES_ROOT, folder, `${folder}.png`);
      let logoImageFileName = '';
      if (fs.existsSync(logoImageFileNameJPG)) {
        logoImageFileName = logoImageFileNameJPG;
      }
      if (fs.existsSync(logoImageFileNamePNG)) {
        logoImageFileName = logoImageFileNamePNG;
      }
      if (logoImageFileName.length === 0) {
        console.error('Missing Logo Image:', folder);
        return undefined;
      }

      const logoImage = mediaRead(logoImageFileName);

      const ttsAudioFileName = path.join(STORIES_ROOT, folder, `${folder}.mp3`);
      if (!fs.existsSync(ttsAudioFileName)) {
        console.error('Missing TTS MP3:', folder);
        return undefined;
      }
      const ttsAudio = mediaRead(ttsAudioFileName);

      const fileNamesInStory = fs.readdirSync(path.join(STORIES_ROOT, folder));

      const additionalMedias = Object.fromEntries(
        fileNamesInStory
          .map((fileNameRelative) => {
            const extName = path.extname(fileNameRelative);
            if (fileNameRelative === path.basename(logoImageFileName)) {
              return undefined;
            }
            if (extName !== '.jpg' && extName !== '.png') {
              return undefined;
            }
            const fileName = path.join(STORIES_ROOT, folder, fileNameRelative);
            return [fileNameRelative, mediaRead(fileName)];
          })
          .filter(Boolean)
      );

      const medias = { logoImage, ttsAudio, ...additionalMedias };

      const tags = story.getTags(storyText, fileNamesInStory);
      const storyHtml = story.toHtml(folder, storyText, fileNamesInStory, medias);
      fs.writeFileSync(`${storyFileName}.dev.html`, storyHtml);
      return {
        title: folder.replaceAll('_', ' '),
        html: storyHtml,
        tags,
        medias
      };
    })
    .filter(Boolean);
}

async function wpCreateTagsIfNotExist(repoStories) {
  const repoTags = functions.unique(repoStories.map(($) => $.tags).flat());
  const wpTags = (await wp.tagList()).map(($) => $.name);
  for (const repoTag of repoTags) {
    if (!wpTags.includes(repoTag)) {
      console.log('Create Tag:', repoTag);
      await wp.tagCreate(repoTag);
    }
  }
}

async function wpCreateMediasIfNotExist(repoStories) {
  const wpMediaTitles = (await wp.mediaList()).map(($) => $.title.rendered);
  for (const repoStory of repoStories) {
    for (const media of Object.values(repoStory.medias)) {
      if (!wpMediaTitles.includes(media.title)) {
        console.log('Create Media:', path.basename(media.fileName));
        await wp.mediaCreate(media.title, media.link, media.content);
      }
    }
  }
}

// go through all stories in the repository and create the story on wordpress if
// it does not already exist.
async function wpCreateStoriesIfNotExist(repoStories) {
  const wpStories = await wp.postList();
  const wpTitles = wpStories.map(($) => $.title.rendered);
  for (const repoStory of repoStories) {
    if (!wpTitles.includes(repoStory.title)) {
      console.log('Create Story:', repoStory.title);
      await wp.postCreate(repoStory.title);
    }
  }
}

async function wpUpdateStories(repoStories, wpTags) {
  const wpStories = await wp.postList();
  for (const repoStory of repoStories) {
    console.log('Update Story:', repoStory.title);
    const wpStory = wpStories.find(($) => $.title.rendered === repoStory.title);
    const tags = repoStory.tags.map(($) => wpTags.find((tag) => tag.name === $).id);
    await wp.postUpdate(wpStory.id, repoStory.html, tags);
  }
}

async function main() {
  const repoStories = repoStoriesList();
  // const repoStories = repoStoriesList().slice(0, 2);
  // console.log(repoStories.map($ => [$.title, $.tags]));

  await wpCreateMediasIfNotExist(repoStories);
  await wpCreateTagsIfNotExist(repoStories);
  const wpTags = await wp.tagList();
  const wpMedias = await wp.mediaList();
  await wpCreateStoriesIfNotExist(repoStories);
  await wpUpdateStories(repoStories, wpTags, wpMedias);
}

await main();
