// story conversion functions

import { DOMParser } from 'linkedom'; // https://www.npmjs.com/package/linkedom
import MarkdownIt from 'markdown-it'; // https://www.npmjs.com/package/markdown-it
import YAML from 'yaml'; // https://www.npmjs.com/package/yaml

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
`;

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
        // create checksum
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

export function convert(folder, story, imageLink, ttsLink) {
    const [html, frontmatter] = storyToHtml(folder, story, imageLink, ttsLink);
    const ttsText = storyToTtsText(story);
    const tags = frontmatterTags(frontmatter);

    return {
        html: html,
        ttsText: ttsText,
        tags: tags,
    }
}
