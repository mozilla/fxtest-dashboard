# [Firefox Test Engineering Dashboard](https://mozilla.github.io/fxtest-dashboard/)

GitHub dashboard for monitoring [Firefox Test Engineering](https://wiki.mozilla.org/TestEngineering)'s issues, pull requests, and more.

___

To add more repositories to the dashboard, edit `config.json` by adding a new object to the `"repos"` array, with the `owner` and `name` of the repository.

___


## Getting Started

Install Node.js and npm on your computer.

[Node.js Download](https://nodejs.org/en/download/)

I recommend Browser Sync if you plan on contributing&#8212;it reloads the Angular app every time you save a file.

`npm install -g browser-sync`

Clone the repository, and navigate to the directory.

`git clone https://github.com/mozilla/fxtest-dashboard.git`

`cd fxtest-dashboard`

Run Browser Sync

`browser-sync start --server --files *`
