
/*
Warning: This is just a prototype, do not use/copy this code for any serious
endeavor.
*/

import { DOMParser } from 'linkedom'; // https://www.npmjs.com/package/linkedom
import * as dotenv from 'dotenv'; // https://www.npmjs.com/package/dotenv
import * as fs from 'fs';
import * as path from 'path';
import MarkdownIt from 'markdown-it'; // https://www.npmjs.com/package/markdown-it
import YAML from 'yaml'; // https://www.npmjs.com/package/yaml

import * as wp from './wp.js';

function unique(array) {
    return array.filter((value, index) => array.indexOf(value) === index);
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

// javascript that is added to every riddle
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
    document.querySelectorAll('p').forEach(node => {
        node.innerHTML = node.innerHTML.replaceAll('\n', ' ');
    });
}

function storyParse(story) {
    const options = { html: true };
    const md = new MarkdownIt(options);
    const [frontmatterString, markdown] = frontmatterSplit(story);
    const document = (new DOMParser()).parseFromString('<html>' + md.render(markdown) + '</html>', 'text/html');
    htmlParagraphNewLine(document);
    htmlSolution(document);
    const html = SOLUTION_JS + document.documentElement.innerHTML;
    const frontmatter = YAML.parse(frontmatterString);
    return [html, frontmatter];
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
        const pathStory = path.join(OFFLINE_ROOT, folder, folder + '_Story.md');
        if (!fs.existsSync(pathStory)) {
            return undefined;
        }
        const title = folder.replaceAll('_', ' ');
        const story = fs.readFileSync(pathStory, 'utf-8');
        const [html, frontmatter] = storyParse(story);
        const tags = frontmatterTags(frontmatter);
        fs.writeFileSync(pathStory + '.html', html);
        return {
            title: title,
            html: html,
            tags: tags,
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
        const wpStory = wpStories.find($ => $.title.rendered === repoStory.title);
        const tags = repoStory.tags.map($ => wpTags.find(tag => tag.name === $).id);
        console.log('Update Story', repoStory.title)
        await wp.postUpdate(wpStory.id, repoStory.html, tags);
    }
}

async function main() {
    const repoStories = repoStoriesList();
    //console.log(repoStories.map($ => [$.title, $.tags]));

    await wpCreateTagsIfNotExist(repoStories);
    const wpTags = await wp.tagList();
    await wpCreateStoriesIfNotExist(repoStories);
    await wpUpdateStories(repoStories, wpTags);
}

await main();
