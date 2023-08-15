# Coding Plan

This is our coding plan for StoryCoder.dev. This plan was made with the help of https://www.educative.io/blog/how-to-plan-a-coding-project. 

# Table of contents

### 1. Decide on your project
### 2. Check online for similar projects
### 3. Choose your language and tools
### 4. List all features and entities
### 5. Map the project architecture
### 6. Mark entities for setup
### 7. Add pseudocode to your diagram
### 8. Make a schedule

# 1. Decide on your project
- What is StoryCoder.dev? StoryCoder.dev is an Open Source Project to which anyone, writers and coders, can contribute. The project consists of writing stories of all genres (comedy, action, detective, love stories, drama, fairy tales, fiction, historical, children’s stories, etc.).
- Somewhere in the story there is a code to solve which can be solved in all programming languages you know, for example Dart, Python, C#, C++, JavaScript, TypeScript, Swift, Java, Ruby, Erlang, Rust and many more! The aim is to create stories with the respective coding solutions.

# 2. Check online for similar projects
- https://shortstoryproject.com/#
- https://www.storyberries.com/
- https://blog.reedsy.com/short-stories/
- https://yourstoryclub.com/read-short-stories-online-free/index.html
- https://www.freechildrenstories.com/
- https://storiestogrowby.org/bedtime-stories-kids-free/
- Further? 

# 3. Choose your language and tools
## Status right now: 
- Wordpress: StoryCoder.dev (https://storycoder.dev/) runs with Wordpress with the Astra Theme.
- The subsite https://storycoder.dev/stories runs with wordpress blogposts, fetched from stories stored on https://github.com/roseTech/storycoder.dev.
## New changes/ planning: 
- Coding: We want to redo the subsite "stories", go away from wordpress for this particular subsite, code it and store it on https://github.com/roseTech/storycoder.dev-backend to be able to programme new features. The new subsite will be running on https://stories.practicecoding.dev.
- Both story sections, the current one on wordpress (https://storycoder.dev/stories) and the planned one on (https://stories.storycoder.dev) will run parallel until the final coded version on (https://stories.storycoder.dev) will be in production. 
- The test site will be: https://stories.practicecoding.dev
- The other parts of the website will still be running on wordpress with the “astra theme” and will follow at a later stage (step by step).

## Coding Languages and Steps:
1)  Front end and UX: Design a nice page first how a story page should look like (see here a current wordpress story page: https://storycoder.dev/erin-the-pangolin/) with figma,html, css
  here
2) Research, evaluate and choose static site generator and
   coding language. Code draft, test draft, put in production.
   
## Open Questions? and Brainstorming:
1) Which static site generator should we use and why?
   Name pro's and con's:
  - Svelte Kit with TypeScript: 
  - Jekyll with JavaScript:
  - Comparison between Svelte Kit and Jekyll:
    https://bejamas.io/compare/jekyll-vs-sveltekit/
    https://programmingpercy.tech/blog/rebuilt-jekyll-blog-with-sveltekit/
- Other site generators? 
    
2) How shall we implement dynamic features? (such as hashed solution input fields, further interactive gamification features?) 


# 4. List all features and entities 
### Current Essential features: see this example of a wordpress blog post: https://storycoder.dev/erin-the-pangolin/
### Stories:
- [ ] Story texts: updated after every commit on GitHub through GitHub actions
- [ ] Story texts: add link to deepl translator (https://www.deepl.com/translator) and google translator 
- [ ] Story pictures: update front pictures and further pictures, 
- [ ] Story pictures: add correct cc licence for pictures
- [ ] Story Audios: AI generated text to speech audios, saved as mp3-files: add reference to used TTS engine on every story
### Coding Solutions
- [ ] hashed solutions input fields
- [ ] hints of story solutions, Add the possibility to not show all hints at once
- [ ] direct hyperlinks to story solutions on github
- [ ] automated available solutions: Show for which languages already a solution exists
### Categorizations and tags  
- [ ] categorization: add story tags and coding tags
- [ ] Create an overview for all stories, where all stories are visible
- [ ] Allow filtering for tags
- [ ] Footer which is visible on all posts/stories

## Future features: Features not yet added, but planned to be added 
### features taken from our open task list on 
- https://github.com/roseTech/storycoder.dev/blob/main/Open-Tasks.md
### Categorizations and tags 
- [ ] Add a story rating system, but instead of regular god/bad, use a sentiment system (story was funny, story made me sad, ...)
### SEO
- [ ] add search-enginge-optimizations
### Tracking
- [ ] avoid tracking; if tracking is necessary, add cooky disclaimer and stay within legal limits
### Gamification
- [ ] Gamification options
### Entities needed: 
- Webserver, user inputs,

# 5. Map the project architecture
- flowchart of our final project, sticky notes or digitally
- how will a user progress through your different program features?
- branching paths, decision points in your program. 
- document touching points. If you find an unsupported input, create the features needed to handle it.

# 6. Mark entities for setup
- set up entities and tools, webservers

# 7. Add pseudocode to your diagram
- how we’ll implement each feature on the flowchart
- write the general type of programming structure 
- how you might connect each feature on the connector line. 
- research about features, tools

# 8. Make a schedule
- set deadlines to complete each feature
- most essential feature first, then features that connect to that, and so on
- Last:  nonessential features, 
- reasonable time estimations based on the complexity of each feature
- distinct dates: divide the work across a manageable period
- set apart project work time, routine, set reminders
- split work, accountability
- order of next steps clear
