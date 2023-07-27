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
What is StoryCoder.dev? StoryCoder.dev is an Open Source Project to which anyone, writers and coders, can contribute. The project consists of writing stories of all genres (comedy, action, detective, love stories, drama, fairy tales, fiction, historical, children’s stories, etc.). Somewhere in the story there is a code to solve which can be solved in all programming languages you know, for example Dart, Python, C#, C++, JavaScript, TypeScript, Swift, Java, Ruby, Erlang, Rust and many more! The aim is to create stories with the respective coding solutions.

# 2. Check online for similar projects
https://shortstoryproject.com/#
https://www.storyberries.com/
https://blog.reedsy.com/short-stories/
https://yourstoryclub.com/read-short-stories-online-free/index.html
https://www.freechildrenstories.com/
https://storiestogrowby.org/bedtime-stories-kids-free/

# 3. Choose your language and tools
### Status right now: 
StoryCoder.dev](https://storycoder.dev/) runs with Wordpress with the Astra Theme. The subsite https://storycoder.dev/stories runs with wordpress blogposts, fetched from stories stored on https://github.com/roseTech/storycoder.dev. 
### New changens/ planning: 
- We want to code the story section and store it on https://github.com/roseTech/storycoder.dev-backend to be able to programme new features. The new subsite will be running on https://stories.practicecoding.dev.
- Both story sections, the current one on wordpress (https://storycoder.dev/stories) and the planned one on (https://stories.practicecoding.dev) will run parallel until the final coded version will be in production. 
- The test site will be: https://stories.practicecoding.dev
- The other parts of the website will still be running on wordpress with the “astra theme” and will follow at a later stage (step by step).

### Brainstorming Coding Languages: Open Questions



- Web Applications: JavaScript or TypeScript: Which one? HTML/CSS, 
- software framework: Angular (JS), React (JS)Node.js (JS) : Which one?
- Static or dynamic website?: In case static website: What about the dynamic features (such as hashed solution input fields, further interactive gamification features?) 

### 4. List all features and entities
# Essential features: see this example of a wordpress blog post: https://storycoder.dev/erin-the-pangolin/
- Story texts 
- Story pictures: front pictures and further pictures
- AI generated text to speech audios, saved as mp3-files
- hashed solutions input fields
- hints of story solutions
- direct hyperlinks to story solutions on github
- automated available solutions
- story tags and coding tags 