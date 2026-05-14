# Oarchestrate

Welcome to **Oarchestrate**, a task management system developed by the Student Interns of Caraga State University for the Engineering and Construction Office (ECO).

## Framework and Modules

The whole system was primarily developed using [Vue](https://github.com/vuejs), [Express](https://github.com/expressjs/express), and the following modules:

1. [Tailwind](https://github.com/tailwindlabs/tailwindcss)
2. [Jordium Gantt Vue](https://github.com/nelson820125/jordium-gantt-vue3)
3. [SheetJS](https://git.sheetjs.com/sheetjs/sheetjs)
4. [JSPDF](https://github.com/parallax/jsPDF)

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)
 
## Future Development
It is recommended to optimise the system, particularly in:

1. UI development. Add proper animations if possible.
2. Notifications. Fixes on the notification for non-Director users.
2. Data processing, especially the repeated calls in database.
3. Data compression or backup for old tasks.
4. Code reusability, especially in the Projects, Tasks, and Subtasks.
5. Performance. Avoid utilizing Virtual DOM and render everything using Direct DOM if possible.
6. Security. Add Cloudflare captcha for small upgrade to security.

## Project Setup

1. Clone this repository using `git` (download as zip if no git installed)
```sh
git clone https://github.com/ECOwebapp/Oarchestrate.git
```

2. Install all dependencies
```sh
pnpm install
```

3. Compile and Hot-Reload for Development

```sh
pnpm dev
```
