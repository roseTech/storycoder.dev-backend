
// just short examples for every used libraries

import process from 'process';
import dotenv from 'dotenv'; // https://www.npmjs.com/package/dotenv
import MarkdownIt from 'markdown-it'; // https://www.npmjs.com/package/markdown-it
import YAML from 'yaml'; // https://www.npmjs.com/package/yaml
import { DOMParser } from 'linkedom'; // https://www.npmjs.com/package/linkedom

function example_dotenv() {
    dotenv.config();
    console.log(process.env.WP_USERNAME);
}

function example_yaml() {
    console.log(YAML.parse('3.14159'));
    console.log(YAML.parse('[ true, false, maybe, null ]'));
}

const EXAMPLE_MARKDOWN = `
# Header

- a
- **b**
- *c*

<div data-solution="ABC"></div>
`;

function example_markdown() {
    const options = { html: true };
    const md = new MarkdownIt(options);
    console.log(md.render(EXAMPLE_MARKDOWN));
}

const EXAMPLE_HTML = `
<p>a b c</p>
<p>d e</p>
<p>f <strong>strong</strong> g</p>
<div data-solution="ABC"></div>
`;

function example_linkedom() {
    const TEXT_NODE = 3;
    const document = (new DOMParser()).parseFromString('<html>' + EXAMPLE_HTML + '</html>', 'text/html');
    // replace text nodes
    document.querySelectorAll('p').forEach(nodeP => {
        for (const node of nodeP.childNodes) {
            if (node.nodeType === TEXT_NODE) {
                node.textContent = '[' + node.textContent + ']';
            }
        }
    });
    // replace nodes with specific attributes
    document.querySelectorAll('div[data-solution]').forEach(nodeDiv => {
        nodeDiv.innerHTML = '<p>Yay</p>';
    });
    console.log(document.documentElement.innerHTML);
}

example_dotenv();
example_yaml();
example_markdown();
example_linkedom();
