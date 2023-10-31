const cmx = require('cmx');

cmx.get('/', (req, res) => res.send(`
    <h1>Hello</h1>
    <p><a href="http://localhost:3000/api/inspect/toHtml">http://localhost:3000/api/inspect</a></p>
`));

cmx.run();
