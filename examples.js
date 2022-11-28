
// just short examples for every used libraries

import * as process from 'process';
import * as dotenv from 'dotenv'; // https://www.npmjs.com/package/dotenv
import MarkdownIt from 'markdown-it'; // https://www.npmjs.com/package/markdown-it
import YAML from 'yaml'; // https://www.npmjs.com/package/yaml

function example_dotenv() {
    dotenv.config();
    console.log(process.env.USERNAME);
}

function example_yaml() {
    console.log(YAML.parse('3.14159'));
    console.log(YAML.parse('[ true, false, maybe, null ]'));
}

function example_markdown() {
    const md = new MarkdownIt();
    console.log(md.render('# Title\n- a\n- b\n- c'));
}

example_dotenv();
example_yaml();
example_markdown();
