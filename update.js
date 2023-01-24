
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

// split a markdown document in the frontmatter and the document
// https://jekyllrb.com/docs/front-matter/
function frontmatterSplit(text) {
    const match = text.match(/\s*---\s*(.*?)\s*---\s*/s);
    const frontmatter = match[1];
    const markdown = text.slice(match[0].length);
    return [frontmatter, markdown];
}

const HTML_HEADER = `
<div class="wp-block-media-text alignfull is-stacked-on-mobile is-vertically-aligned-center">
    <figure class="wp-block-media-text__media">
        <img src="https://practicecoding.dev/wp-content/uploads/2023/01/hd-wallpaper-valentine-valentines-day-1953964-1024x682.jpg" class="wp-image-389 size-full" />
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
function check(nodeButton) {
    const nodeDiv = nodeButton.parentNode;
    const isCorrect = nodeDiv.children[0].value === nodeDiv.getAttribute('data-solution');
    nodeDiv.children[2].innerText = isCorrect ? "Correct! :) 👌🥳🎉" : "Wrong :( 😇🧶 Try Again";
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

function storyParse(folder, story) {
    const options = { html: true };
    const md = new MarkdownIt(options);
    const [frontmatterString, markdown] = frontmatterSplit(story);
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

// go through all stories in the repository a create HTML out of it. This HTML
// later can be used to upload to e.g. wordpress.
function repoStoriesList() {
    return fs.readdirSync(OFFLINE_ROOT).map(folder => {
        const storyFileName = path.join(OFFLINE_ROOT, folder, folder + '_Story.md');
        if (!fs.existsSync(storyFileName)) {
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
            return undefined;
        }
        const imageFile = fs.readFileSync(imageFileName);
        const imageTitle = checksum(imageFile);
        const title = folder.replaceAll('_', ' ');
        const story = fs.readFileSync(storyFileName, 'utf-8');
        const [html, frontmatter] = storyParse(folder, story);
        const tags = frontmatterTags(frontmatter);
        //fs.writeFileSync(storyFileName + '.dev.html', html);
        return {
            title: title,
            html: html,
            tags: tags,
            imageFileName: imageFileName,
            imageFile: imageFile,
            imageTitle: imageTitle,
        };
    }).filter($ => $); // remove undefined
}

async function wpCreateTagsIfNotExist(repoStories) {
    const repoTags = unique(repoStories.map($ => $.tags).flat());
    const wpTags = (await wp.tagList()).map($ => $.name);
    for (const repoTag of repoTags) {
        if (!wpTags.includes(repoTag)) {
            console.log('Create Tag', repoTag);
            wp.tagCreate(repoTag);
        }
    }
}

async function wpCreateMediasIfNotExist(repoStories) {
    const wpMedias = await wp.mediaList();
    //console.log(wpMedias[0]);
    //console.log(wpMedias[0].guid.rendered);

    //const filename = 'test.png';
    //const image = fs.readFileSync(filename);
    //const title = checksum(image);
    //await wp.mediaCreate(title, title + path.extname(filename), image);
}

// go through all stories in the repository and create the story on wordpress if
// it do not already exist.
async function wpCreateStoriesIfNotExist(repoStories) {
    const wpStories = await wp.postList();
    const wpTitles = wpStories.map($ => $.title.rendered);
    for (const repoStory of repoStories) {
        if (!wpTitles.includes(repoStory.title)) {
            console.log('Create Story', repoStory.title);
            await wp.postCreate(repoStory.title);
        }
    }
}

async function wpUpdateStories(repoStories, wpTags) {
    const wpStories = await wp.postList();
    for (const repoStory of repoStories) {
        console.log('Update Story', repoStory.title)
        const wpStory = wpStories.find($ => $.title.rendered === repoStory.title);
        const tags = repoStory.tags.map($ => wpTags.find(tag => tag.name === $).id);
        await wp.postUpdate(wpStory.id, repoStory.html, tags);
    }
}

async function main() {
    const repoStories = repoStoriesList();
    //const repoStories = repoStoriesList().slice(0, 5);
    //console.log(repoStories.map($ => [$.title, $.tags]));

    await wpCreateTagsIfNotExist(repoStories);
    //await wpCreateMediasIfNotExist(repoStories);
    const wpTags = await wp.tagList();
    const wpMedias = await wp.mediaList();
    await wpCreateStoriesIfNotExist(repoStories);
    await wpUpdateStories(repoStories, wpTags);
}

await main();
