import { assert } from 'console';
import * as dotenv from 'dotenv'; // https://www.npmjs.com/package/dotenv
import * as https from 'https';
import * as process from 'process';

dotenv.config();

const AUTH = process.env.WP_USERNAME + ':' + process.env.WP_PASSWORD;

const URL = 'https://practicecoding.dev';

const URL_POSTS = URL + '/wp-json/wp/v2/posts';
const URL_TAGS = URL + '/wp-json/wp/v2/tags';
const URL_CATEGORIES = URL + '/wp-json/wp/v2/categories';

// HTTP GET
async function get(url) {
    console.log('get ' + url);
    return new Promise((resolve) => {
        let responseBody = '';
        const options = {};
        https.get(url, options, res => {
            res.on('data', chunk => responseBody += chunk);
            res.on('end', () => {
                // res.statuscode ???
                resolve(JSON.parse(responseBody));
            });
        });
    });
}

async function getMany(url) {
    const MAX_PAGE = 50;
    const bodies = [];
    for (let page = 1; page <= MAX_PAGE; page += 1) {
        const body = await get(url + '?per_page=100&page=' + page);
        if (body.length == 0) {
            break;
        }
        bodies.push(body);
    }
    return bodies.flat();
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
                // res.statuscode ???
                resolve(JSON.parse(responseBody));
            });
        });
        req.write(requestBody);
        req.end();
    });
}

// https://developer.wordpress.org/rest-api/reference/posts/

// fetch all stories which are currently available
export async function postList() {
    const body = await get(URL_POSTS + '?per_page=100&page=1');
    return body;
}

// create a new story
//
// title: string
export async function postCreate(title) {
    const body = await post(URL_POSTS, { title: title });
}

// update an existing story
//
// id: integer
// content: string
// tags: array of integers
export async function postUpdate(id, content, tags) {
    const body = await post(URL_POSTS + '/' + id, { content: content, tags: [tags], status: 'publish' });
    //console.log(body);
}

// https://developer.wordpress.org/rest-api/reference/tags/

export async function tagList() {
    const body = await getMany(URL_TAGS);
    //assert(res.statusCode === 200);
    return body;
}

// name: string
export async function tagCreate(name) {
    const body = await post(URL_TAGS, { name: name });
    //assert(res.statusCode === 201);
    //console.log(res.statusCode, body);
}

// https://developer.wordpress.org/rest-api/reference/categories/

export async function categoryList() {
    const body = await get(URL_CATEGORIES);
    return body;
}
