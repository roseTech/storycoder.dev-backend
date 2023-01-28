
import { DOMParser } from 'linkedom'; // https://www.npmjs.com/package/linkedom
import crypto from 'crypto';
import fs from 'fs';
import MarkdownIt from 'markdown-it'; // https://www.npmjs.com/package/markdown-it
import path from 'path';
import YAML from 'yaml'; // https://www.npmjs.com/package/yaml

import * as wp from './wp.js';

function unique(array) {
    return array.filter((value, index) => array.indexOf(value) === index);
}

function checksum(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

// format('Hello {0}', 'World') -> 'Hello World'
function formatn(text, ...vars) {
    return text.replace(/{(\d+)}/g, function (match, number) {
        return typeof vars[number] === 'undefined' ? match : vars[number];
    });
}

// format('Hello {t}', {t: 'World'}) -> 'Hello World'
function format(text, vars) {
    return text.replace(/{(\w+)}/g, function (_, match) {
        return typeof vars[match] === 'undefined' ? match : vars[match];
    });
}

const OFFLINE_ROOT = '../storycoder.dev'; // the path were the stories are

// split a document into the frontmatter part and the markdown part
// https://jekyllrb.com/docs/front-matter/
function documentSplit(text) {
    const match = text.match(/\s*---\s*(.*?)\s*---\s*/s);
    const frontmatter = match[1];
    const markdown = text.slice(match[0].length);
    return [frontmatter, markdown];
}

const HTML_HEADER = `
<div class="wp-block-media-text alignfull is-stacked-on-mobile is-vertically-aligned-center">
    <figure class="wp-block-media-text__media">
        <img src="https://practicecoding.dev/wp-content/uploads/{imageLink}" class="size-full" />
    </figure>
    <div class="wp-block-media-text__content">
        <h1 class="has-text-align-center">{title}</h1>
        <h2 class="has-text-align-center">
            <a href="{linkGitHub}">Code Solutions on GitHub ↗</a>
        </h2>
    </div>
</div>
<p>&nbsp;</p>
<ul>
    <li><a href="https://www.deepl.com/translator">DeepL Translator ↗</a></li>
    <li><a href="{linkGoogleTranslate}">Google Translate ↗</a></li>
</ul>
<figure class="wp-block-audio">
    <audio controls src="https://practicecoding.dev/wp-content/uploads/{ttsLink}"></audio>
</figure>
<p>&nbsp;</p>
`;

const HTML_FOOTER = `
<p>&nbsp;</p>
<figure class="wp-block-table is-style-stripes"><table><tbody>
    <tr><th class="has-text-align-center">Category</th><td>{category}</td></tr>
    <tr><th class="has-text-align-center">Coding Level</th><td>{codingLevel}</td></tr>
    <tr><th class="has-text-align-center">Coding Ideas</th><td>{codingIdeas}</td></tr>
    <tr><th class="has-text-align-center">Coding Languages</th><td><a href="{linkGitHub}">Code Solutions on GitHub ↗</a></td></tr>
    <tr><th class="has-text-align-center">Story Genre</th><td>{storyGenre}</td></tr>
    <tr><th class="has-text-align-center">Story Content Key Words</th><td>{storyContent}</td></tr>
    <tr><th class="has-text-align-center">Story License</th><td>{storyLicense}</td></tr>
    <tr><th class="has-text-align-center">How To Quote Story</th><td>({author}, adapted by StoryCoder.dev under {storyLicense})</td></tr>
    <tr><th class="has-text-align-center">Picture License</th><td>{imageLicense}</td></tr>
    <tr><th class="has-text-align-center">How to Quote Picture</th><td>(adapted by StoryCoder.dev under {imageLicense})</td></tr>
    <tr><th class="has-text-align-center">Title</th><td>{title}</td></tr>
    <tr><th class="has-text-align-center">Author</th><td>{author}</td></tr>
</tbody></table></figure>
`

// javascript that is added to every riddle once
// TODO add custom javascript to the wordpress header?
const SOLUTION_JS = `
<script>
const answerCorrect = "Correct! :) 👌🥳🎉";
const answerWrong = "Wrong :( 😇🧶 Try Again";

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);                    
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function check(nodeButton) {
    const nodeDiv = nodeButton.parentNode;
    const isCorrect = await sha256( nodeDiv.children[0].value ) === nodeDiv.getAttribute('data-solution');
    nodeDiv.children[2].innerText = isCorrect ? answerCorrect : answerWrong;
}
</script>
`;

const SOLUTION_HTML = '<input type="text"><button onclick="check(this)">Check</button> <span></span>';

// replace every <div data-solution="..."><div> with HTML
function htmlSolution(document) {
    document.querySelectorAll('div[data-solution]').forEach(nodeDiv => {
        nodeDiv.innerHTML = SOLUTION_HTML;
    });
}

function htmlParagraphNewLine(document) {
    document.querySelectorAll('p, script').forEach(node => {
        node.innerHTML = node.innerHTML.replaceAll('\n', ' ');
    });
}

function storyToHtml(folder, story, imageLink, ttsLink) {
    const options = { html: true };
    const md = new MarkdownIt(options);
    const [frontmatterString, markdown] = documentSplit(story);
    const frontmatter = YAML.parse(frontmatterString);
    const linkGitHub = 'https://github.com/roseTech/storycoder.dev/tree/main/' + folder;
    const linkGoogleTranslateStory = folder.replaceAll('_', '-').toLowerCase();
    const linkGoogleTranslate = 'https://practicecoding-dev.translate.goog/' + linkGoogleTranslateStory + '/?_x_tr_sl=auto&_x_tr_tl=en';
    const vars = {
        codingLevel: frontmatter['Coding Level'],
        codingIdeas: frontmatter['Coding Ideas'],
        storyGenre: frontmatter['Story Genre'],
        storyContent: frontmatter['Story Content'],
        storyLicense: frontmatter['Story License'],
        imageLicense: frontmatter['Image License'],
        imageSource: frontmatter['Image Source'],
        imageLink: imageLink,
        ttsLink: ttsLink,
        category: frontmatter['Category'],
        author: frontmatter['Author'],
        title: frontmatter.Title,
        linkGitHub: linkGitHub,
        linkGoogleTranslate: linkGoogleTranslate,
    };
    const htmlHeader = format(HTML_HEADER, vars);
    const htmlFooter = format(HTML_FOOTER, vars);
    const htmlMarkdown = md.render(markdown);
    const html = SOLUTION_JS + htmlHeader + htmlMarkdown + htmlFooter;
    const document = (new DOMParser()).parseFromString('<html>' + html + '</html>', 'text/html');
    htmlParagraphNewLine(document);
    htmlSolution(document);
    const htmlFixed = document.documentElement.innerHTML;
    return [htmlFixed, frontmatter];
}

function frontmatterTags(frontmatter) {
    function split(key) {
        const value = frontmatter[key];
        return value === null ? [] : frontmatter[key].split(',').map($ => $.trim().toLowerCase()).filter($ => $.length > 1);
    }
    const tags = [].concat(split('Category'), split('Story Content'), split('Story Genre'), split('Coding Level'), split('Coding Ideas'));
    return tags;
}

function storyToTtsText(story) {
    const [frontmatterString, markdown] = documentSplit(story);

    // http://erogol.com/ddc-samples/

    let text = markdown;
    text = text.replace(/<div.*?div>/g, '');
    text = text.replace(/[^a-zA-Z0-9$!?',:%\+\-\.\n ]/g, '');
    text = text.replaceAll('\n', ' ');
    text = text.replace(/ +/g, ' ');

    return text;
}

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
        const ttsFileName = path.join(OFFLINE_ROOT, folder, folder + '.mp3');
        if (!fs.existsSync(ttsFileName)) {
            console.error('Missing TTS MP3:', folder);
            return undefined;
        }
        const image = fs.readFileSync(imageFileName);
        const tts = fs.readFileSync(ttsFileName);
        const story = fs.readFileSync(storyFileName, 'utf-8');
        const imageTitle = checksum(image);
        const imageLink = imageTitle + path.extname(imageFileName);
        const ttsTitle = checksum(tts);
        const ttsLink = ttsTitle + path.extname(ttsFileName);
        const [html, frontmatter] = storyToHtml(folder, story, imageLink, ttsLink);
        const ttsText = storyToTtsText(story);
        const tags = frontmatterTags(frontmatter);
        //fs.writeFileSync(storyFileName + '.dev.html', html);
        fs.writeFileSync(storyFileName + '.dev.tts', ttsText);
        return {
            title: folder.replaceAll('_', ' '),
            html: html,
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
    }).filter($ => $); // remove undefined
}

async function wpCreateTagsIfNotExist(repoStories) {
    const repoTags = unique(repoStories.map($ => $.tags).flat());
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
// it do not already exist.
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
