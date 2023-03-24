
# storycoder.dev-backend

This is the backend of storycoder.dev. storycoder.dev is an Open Source project to which anyone, writers and coders, can contribute. The project consists of writing stories of all genres (comedy, action, detective, love stories, drama, fairy tales, fiction, historical, children's stories, etc.). 

For more details see also : https://github.com/roseTech/storycoder.dev

## First Steps

1. Install [nodejs](https://nodejs.org)
2. Open a terminal/shell a go into the directory where this repository was cloned/copied to
3. Install all dependencies: `npm install`
4. Create an API password within WordPress (/wp-admin/profile.php)
5. Copy the file `template.env` to `.env` and adapt all the variables inside the `.env` file (use the the API passowrd generated in the previous step)
6. Run the examples script: `node examples.js`
7. If this works without any problem, update the frontend: `node update.js`

## Summary

What is `update.js` really doing?

- Converts all stories written in Markdown to HTML. To be more precise into a HTML fragment which WordPress understands. Note: WordPress internally stores posts as HTML.
- Upload all media files (image, audio, ...) which are referenced by any of stories to WordPress. To not upload media files, which are already uploaded the following is done: The name of all media files is the checksum of the media file itself. WordPress is therefore acts as content adressable store.
- Create or update all stories and upload the previously generated HTML.

## Contributors

- https://github.com/toleksa

## Thoughts

1. Content and presentation should be separated: Why? There will quite likely be several presentations, web pages, PDF, apps, ... also people with different perferences/abilities would like to use the content: color blindnes, dark mode, ... If content and presentation is separated, then having all this different presentation can more easily be done, also presentation can be changed at any time, without the necessity to always adapt the content to a new presentation.
2. A story should have exactly one source of truth: Why? If the same story is stored in different places and then modified at this different places, somebody has to merge all the changes together, either manually or partially automatically.
3. No vendor lock-in: Technologies should be choosen which are not under full control of a single company. Why? We do not want too loose our stories, or if there is some user data collected, which gets lost in case the company, for whatever reason, has to shutdown their service. The internet is full of this stories, lets not repeat the mistake many others were doing.
4. Future proof: Choose technologies which would allow easy transition to another technology. Why? Under the assumption that storycoder will grow in the future, technologies which are a good choice at the moment, may have to be changed in the future.
5. Privacy: User privacy is not an after thought. Why? Despite the popular opinion that you have nothing to hide, privacy is and was always there for some people who need it. It's like free speech, you may not care about it, but it matters to people with less rights.

Current situation

1. At the moment Markdown is used for the content, which is at the moment a good enough separation. In case this format is not good enough, a Markdown parser can be helpful to convert Markdown into another format.
2. At the moment this is GitHub. While not really beginner friendly, at least all modifications are visible to the public and could be reverted.
3. There are many git hosters available and in the worst case could be hosted by ourselves. Markdown is simple enough, that even if all software libries in current use would be unavailable, we could convert it to something else.
4. Git and markdown are simple enough to be converted into other formats. Also both technologies are widely used, not just by a singke company. The biggest downside of markdown is, that it is not standardized, there are various different quasi-standards. Not that it matters, but: A git/mercurial alike source control software, is is quite simple to reimplement in any programming language.
5. Currently we do not store any user related data and there is no tracking on storycoder.dev. In case a login would be necessary, we should consider not using a password. Quite a few services like e.g. glitch.me are doing this. In general we should avoid storing anything which is not necessary, there is e.g. quite likely no need to store a phone number, or even a first or surname. If some data should be stored, we should ask ourselves first what the specific usecase is and not just because its possible and because everyone is doing it.
