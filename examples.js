// just short examples for every used libraries

import process from 'process';
import dotenv from 'dotenv'; // https://www.npmjs.com/package/dotenv
import MarkdownIt from 'markdown-it'; // https://www.npmjs.com/package/markdown-it
import YAML from 'yaml'; // https://www.npmjs.com/package/yaml
import { DOMParser } from 'linkedom'; // https://www.npmjs.com/package/linkedom
import FormData from 'form-data'; // https://www.npmjs.com/package/form-data
import http2 from 'http2';

function exampleHttp() {
  console.log(http2.constants.HTTP_STATUS_OK);
}

function exampleDotenv() {
  dotenv.config();
  console.log(process.env.WP_API_USERNAME);
}

function exampleYaml() {
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

function exampleMarkdown() {
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

function exampleLinkedDom() {
  const TEXT_NODE = 3;
  const document = new DOMParser().parseFromString(`<html>${EXAMPLE_HTML}</html>`, 'text/html');
  // replace text nodes
  document.querySelectorAll('p').forEach((nodeP) => {
    for (const node of nodeP.childNodes) {
      if (node.nodeType === TEXT_NODE) {
        node.textContent = `[${node.textContent}]`;
      }
    }
  });
  // replace nodes with specific attributes
  document.querySelectorAll('div[data-solution]').forEach((nodeDiv) => {
    nodeDiv.innerHTML = '<p>Yay</p>';
  });
  console.log(document.documentElement.innerHTML);
}

function exampleFormData() {
  const form = new FormData();
  form.append('title', 'Hello World');
  form.append('x', 'this is x');
  form.append('y', 'this is y');

  console.log(form.getHeaders());
  console.log(form.getBuffer());
  console.log(form.getBuffer().length);
  console.log(form.getBuffer().toString());
}

exampleHttp();
exampleDotenv();
exampleYaml();
exampleMarkdown();
exampleLinkedDom();
exampleFormData();
