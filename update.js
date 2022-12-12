
/*
Warning: This is just a prototype, do not use/copy this code for any serious
endeavor.
*/

import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as dotenv from 'dotenv'; // https://www.npmjs.com/package/dotenv
import MarkdownIt from 'markdown-it'; // https://www.npmjs.com/package/markdown-it
import { DOMParser } from 'linkedom'; // https://www.npmjs.com/package/linkedom

dotenv.config();

const AUTH = process.env.WP_USERNAME + ':' + process.env.WP_PASSWORD;
const OFFLINE_ROOT = '../storycoder.dev'; // the path were the stories are 
const ONLINE_URL = 'https://practicecoding.dev/wp-json/wp/v2/posts';

// HTTP GET
async function get(url) {
    console.log('get ' + url);
    return new Promise((resolve) => {
        let responseBody = '';
        const options = {};
        https.get(url, options, res => {
            res.on('data', chunk => responseBody += chunk);
            res.on('end', () => {
                resolve(responseBody);
            });
        });
    });
}

// HTTP POST
async function post(url, data) {
    console.log('post ' + url);
    const requestBody = JSON.stringify(data);
    return new Promise((resolve) => {
        let responseBody = '';
        const options = {
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody),
            },
            auth: AUTH,
            method: 'POST',
        };
        const req = https.request(url, options, res => {
            res.on('data', chunk => responseBody += chunk);
            res.on('end', () => {
                resolve(JSON.parse(responseBody));
            });
        });
        req.write(requestBody);
        req.end();
    });
}

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
function htmlSolution(html) {
    const document = (new DOMParser()).parseFromString('<html>' + html + '</html>', 'text/html');
    document.querySelectorAll('div[data-solution]').forEach(nodeDiv => {
        nodeDiv.innerHTML = SOLUTION_HTML;
    });
    return document.documentElement.innerHTML;
}

// go through all stories in the repository a create HTML out of it. This HTML
// later can be used to upload to e.g. wordpress.
function repoStoriesList() {
    const options = { html: true };
    const md = new MarkdownIt(options);
    return fs.readdirSync(OFFLINE_ROOT).map(folder => {
        const pathStory = path.join(OFFLINE_ROOT, folder, folder + '_Story.md');
        if (!fs.existsSync(pathStory)) {
            return undefined;
        }
        const title = folder.replaceAll('_', ' ');
        const story = fs.readFileSync(pathStory, 'utf-8');
        const [fm, markdown] = frontmatterSplit(story);

        // TODO move the whole generation into a function
        let html = md.render(markdown);
        // TODO use also DOMParser
        html = html.replaceAll(/<p>.*?<\/p>/gs, match => {
            return match.replaceAll('\n', ' ');
        });
        html = htmlSolution(html);
        html = SOLUTION_JS + html;
        // fs.writeFileSync(pathStory + '.html', html);
        return {
            title: title,
            path: pathStory,
            html: html,
        };
    }).filter($ => $);
}

// fetch all stories which are currently available on wordpress
async function wpStoriesList(fetchOnline) {
    if (fetchOnline) {
        const result = await get(ONLINE_URL + '?per_page=50');
        // writing the result to a file is just helpful for debugging
        fs.writeFileSync('stories.json', result)
    }
    const data = fs.readFileSync('stories.json');
    const json = JSON.parse(data);
    return json;
}

// create a new story on wordpress
async function wpStoriesCreate(title) {
    const resultCreate = await post(ONLINE_URL, { title: title });
    if (resultCreate.id === undefined) {
        console.error(resultCreate);
    }
    const resultPublish = await post(ONLINE_URL + '/' + resultCreate.id, { status: 'publish' });
}

// update an existing story on wordpress
async function wpStoriesUpdate(id, content) {
    const result = await post(ONLINE_URL + '/' + id, { content: content });
    //console.log(result);
}

// go through all stories in the repository and create the story on wordpress if
// it do not already exist.
async function createIfNotExist(repoStories, wpStories) {
    const wpTitles = wpStories.map($ => $.title.rendered);
    for (const story of repoStories) {
        if (!wpTitles.includes(story.title)) {
            console.log(story.title);
            await wpStoriesCreate(story.title);
        }
    }
}

async function update(repoStories, wpStories) {
    for (const repoStory of repoStories) {
        const wpStory = wpStories.find($ => $.title.rendered == repoStory.title);
        await wpStoriesUpdate(wpStory.id, repoStory.html);
    }
}

async function main() {
    const repoStories = repoStoriesList();
    // create stories on wordpress which do not already exist
    const wpStoriesBeforeCreate = await wpStoriesList(true);
    await createIfNotExist(repoStories, wpStoriesBeforeCreate);
    // update the content of all stories
    const wpStories = await wpStoriesList(true);
    await update(repoStories, wpStories);

    //await wpStoriesUpdate(220, "A&B\"C+D");
}

await main();
