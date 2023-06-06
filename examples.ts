// just short examples for every used library

import process from 'process';
import dotenv from 'dotenv'; // https://www.npmjs.com/package/dotenv
import { stringify } from 'yaml'; // https://www.npmjs.com/package/yaml
import { constants as HttpConstants } from 'http2';
import { get as getRequest } from 'https';
import MarkdownIt from 'markdown-it';

const enum TestTypes {
  HTTP_REQUEST = 'HTTP REQUEST',
  DOTENV_CONFIG = 'DOTENV CONFIG',
  YAML = 'YAML PARSER'
}

function printTestHeader(exampleType: string): void {
  console.log('\n');
  console.log('// ///////////////////////');
  console.log(`// ${exampleType} TEST`);
  console.log('// ///////////////////////');
}

function printTestFooter(exampleType: string): void {
  console.log(`✅  ${exampleType} PASSED`);
}

function httpExample(): void {
  getRequest('https://catfact.ninja/fact', (response) => {
    const data: Uint8Array[] = [];

    response.on('data', (chunk) => {
      data.push(chunk);
    });

    response.on('end', () => {
      printTestHeader(TestTypes.HTTP_REQUEST);
      if (response.statusCode === HttpConstants.HTTP_STATUS_OK) {
        const { fact } = JSON.parse(Buffer.concat(data).toString());

        console.log('✔️  Http request properly fetched');
        console.log("✔️  Today's fact about cats: ", fact);
        printTestFooter(TestTypes.HTTP_REQUEST);
      } else {
        throw new Error('❌  HTTP Request failed');
      }
    });

    response.on('error', (err) => {
      console.error(err);
    });
  });
}

function dotenvExample(): void {
  printTestHeader(TestTypes.DOTENV_CONFIG);
  const getEnvironmentValue = (envPropertyKey: string): void => {
    const valueFromEnv: string | undefined = process.env[envPropertyKey];
    if (valueFromEnv != null) {
      console.log(`✔️  Value for ${envPropertyKey} has been set. Check twice if set value is correct.`);
    } else {
      throw new Error(`❌  ${envPropertyKey} is missing`);
    }
  };

  dotenv.config();
  getEnvironmentValue('WP_API_USERNAME');
  getEnvironmentValue('WP_API_PASSWORD');
  getEnvironmentValue('WP_URL');
  getEnvironmentValue('STORIES_ROOT');
  printTestFooter(TestTypes.DOTENV_CONFIG);
}

function yamlParserExample(): void {
  printTestHeader(TestTypes.YAML);

  const firstValue: Array<string | boolean | null> = [true, false, 'maybe', null];
  const firstParsedYaml: string = stringify(firstValue);
  console.log('Initial value:', firstValue);
  console.log('Value serialized to .yml:');
  console.log(firstParsedYaml);

  const secondValue = { number: 3, plain: 'string', block: 'two\nlines' };
  const secondParsedYaml = stringify(secondValue);
  console.log('Initial value:', secondValue);
  console.log('Value serialized to .yml:');
  console.log(secondParsedYaml);

  printTestFooter(TestTypes.YAML);
}

const EXAMPLE_MARKDOWN = `
# Header

- a
- **b**
- *c*

<div data-solution="ABC"></div>
`;

function markdownParserExample(): void {
  const options = { html: true };
  const md = new MarkdownIt(options);
  console.log(md.render(EXAMPLE_MARKDOWN));
}

// const EXAMPLE_HTML = `
// <p>a b c</p>
// <p>d e</p>
// <p>f <strong>strong</strong> g</p>
// <div data-solution="ABC"></div>
// `;
//
// function exampleLinkedDom(): void {
//   const TEXT_NODE = 3;
//   const document = new DOMParser().parseFromString(`<html>${EXAMPLE_HTML}</html>`, 'text/html');
//   // replace text nodes
//   document.querySelectorAll('p').forEach((nodeP) => {
//     for (const node of nodeP.childNodes) {
//       if (node.nodeType === TEXT_NODE) {
//         node.textContent = `[${node.textContent}]`;
//       }
//     }
//   });
//   // replace nodes with specific attributes
//   document.querySelectorAll('div[data-solution]').forEach((nodeDiv) => {
//     nodeDiv.innerHTML = '<p>Yay</p>';
//   });
//   console.log(document.documentElement.innerHTML);
// }
//
// function exampleFormData(): void {
//   const form = new FormData();
//   form.append('title', 'Hello World');
//   form.append('x', 'this is x');
//   form.append('y', 'this is y');
//
//   console.log(form.getHeaders());
//   console.log(form.getBuffer());
//   console.log(form.getBuffer().length);
//   console.log(form.getBuffer().toString());
// }

httpExample();
dotenvExample();
yamlParserExample();
markdownParserExample();
// exampleLinkedDom();
// exampleFormData();
