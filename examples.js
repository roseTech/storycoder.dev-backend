
// just short examples for every used libraries

import * as process from 'process';
import * as dotenv from 'dotenv'; // https://www.npmjs.com/package/dotenv
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
`;

function example_markdown() {
    const md = new MarkdownIt();
    console.log(md.render(EXAMPLE_MARKDOWN));
}

const EXAMPLE_HTML = `
<p>a b c</p>
<p>d e</p>
<p>f <strong>strong</strong> g</p>
`;

function example_linkedom() {
    const TEXT_NODE = 3;
    const document = (new DOMParser()).parseFromString(EXAMPLE_HTML, 'text/html');
    document.querySelectorAll('p').forEach(nodeP => {
        for (const node of nodeP.childNodes) {
            if (node.nodeType == TEXT_NODE) {
                console.log('[' + node.textContent + ']');
            }
        }
    });
}

example_dotenv();
example_yaml();
example_markdown();
example_linkedom();
