## Code Editor for Turtle Universe
Welcome to the code editor for Turtle Universe. It also serves as the client-side interface to ChatLogo, the natural-programming language interface of NetLogo.

### Prerequisites
To set up the environment, use `npm install`. You might also need to install `rollup` and `lezer-generator` globally by running the following commands:

```
npm install @lezer/generator --global
npm install rollup --global
```

### Building the Project
1. Before building the project, clone [CodeMirror-NetLogo](https://github.com/NetLogo-Mobile/CodeMirror-NetLogo) into the same parent folder. You might need to build that project first.
2. To build the project, run `npm run build` or `npm run release`. The second command creates an uglified and compressed bundle. Out of mysterious reasons, the second command might succeed even when the first one fails.

### ChatLogo
At this moment, the client will automatically connect to `http://localhost:3000/` for the ChatLogo server.

### Contributing
Contributions to this project are welcome.

### License
Copyright (C) 2023 John Chen. All rights reserved.
