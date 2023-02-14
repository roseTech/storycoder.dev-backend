
import fs from 'fs';
import path from 'path';

import * as wp from './wp.js';
import * as story from './story.js';
import * as functions from './functions.js';

const OFFLINE_ROOT = '../storycoder.dev'; // the path were the stories are

// go through all stories in the repository a create HTML out of it. This HTML
// later can be used to upload to e.g. wordpress.
function repoStoriesList() {
    return fs.readdirSync(OFFLINE_ROOT).map(folder => {
        if (folder.startsWith('.') || fs.lstatSync(path.join(OFFLINE_ROOT, folder)).isFile()) {
            return undefined;
        }
        const storyFileName = path.join(OFFLINE_ROOT, folder, folder + '_Story.md');
        if (!fs.existsSync(storyFileName)) {
            console.error('Missing Story:', folder);
            return undefined;
        }
        const storyText = fs.readFileSync(storyFileName, 'utf-8');
        const ttsText = story.toTtsText(storyText);
        fs.writeFileSync(storyFileName + '.dev.tts', ttsText);

        const imageFileNameJPG = path.join(OFFLINE_ROOT, folder, folder + '.jpg');
        const imageFileNamePNG = path.join(OFFLINE_ROOT, folder, folder + '.png');
        let imageFileName = '';
        if (fs.existsSync(imageFileNameJPG)) {
            imageFileName = imageFileNameJPG;
        }
        if (fs.existsSync(imageFileNamePNG)) {
            imageFileName = imageFileNamePNG;
        }
        if (imageFileName.length === 0) {
            console.error('Missing Picture:', folder);
            return undefined;
        }
        const image = fs.readFileSync(imageFileName);

        const ttsFileName = path.join(OFFLINE_ROOT, folder, folder + '.mp3');
        if (!fs.existsSync(ttsFileName)) {
            console.error('Missing TTS MP3:', folder);
            return;
        }
        const tts = fs.readFileSync(ttsFileName);
        const tags = story.getTags(storyText);
        const imageTitle = functions.checksum(image);
        const imageLink = imageTitle + path.extname(imageFileName);
        const ttsTitle = functions.checksum(tts);
        const ttsLink = ttsTitle + path.extname(ttsFileName);
        const storyHtml = story.toHtml(folder, storyText, imageLink, ttsLink);
        fs.writeFileSync(storyFileName + '.dev.html', storyHtml);
        return {
            title: folder.replaceAll('_', ' '),
            html: storyHtml,
            tags: tags,
            imageFileName: imageFileName,
            imageTitle: imageTitle,
            imageLink: imageLink,
            image: image,
            ttsFileName: ttsFileName,
            ttsTitle: ttsTitle,
            ttsLink: ttsLink,
            tts: tts,

        };
    }).filter(functions.notUndefined);
}

async function wpCreateTagsIfNotExist(repoStories) {
    const repoTags = functions.unique(repoStories.map($ => $.tags).flat());
    const wpTags = (await wp.tagList()).map($ => $.name);
    for (const repoTag of repoTags) {
        if (!wpTags.includes(repoTag)) {
            console.log('Create Tag:', repoTag);
            wp.tagCreate(repoTag);
        }
    }
}

async function wpCreateMediasIfNotExist(repoStories) {
    const wpMediaTitles = (await wp.mediaList()).map($ => $.title.rendered);
    for (const repoStory of repoStories) {
        if (!wpMediaTitles.includes(repoStory.imageTitle)) {
            console.log('Create Media:', path.basename(repoStory.imageFileName));
            await wp.mediaCreate(repoStory.imageTitle, repoStory.imageLink, repoStory.image);
        }
        if (!wpMediaTitles.includes(repoStory.ttsTitle)) {
            console.log('Create Media:', path.basename(repoStory.ttsFileName));
            await wp.mediaCreate(repoStory.ttsTitle, repoStory.ttsLink, repoStory.tts);
        }
    }
}

// go through all stories in the repository and create the story on wordpress if
// it does not already exist.
async function wpCreateStoriesIfNotExist(repoStories) {
    const wpStories = await wp.postList();
    const wpTitles = wpStories.map($ => $.title.rendered);
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
        console.log('Update Story:', repoStory.title)
        const wpStory = wpStories.find($ => $.title.rendered === repoStory.title);
        const tags = repoStory.tags.map($ => wpTags.find(tag => tag.name === $).id);
        await wp.postUpdate(wpStory.id, repoStory.html, tags);
    }
}

async function main() {
    const repoStories = repoStoriesList();
    //const repoStories = repoStoriesList().slice(0, 2);
    //console.log(repoStories.map($ => [$.title, $.tags]));

    await wpCreateMediasIfNotExist(repoStories);
    await wpCreateTagsIfNotExist(repoStories);
    const wpTags = await wp.tagList();
    const wpMedias = await wp.mediaList();
    await wpCreateStoriesIfNotExist(repoStories);
    await wpUpdateStories(repoStories, wpTags, wpMedias);
}

await main();
