# CMXpress

_JSON-Schema based headless CMS_

NOTE! [SurrealDB(-access options)](https://surrealdb.com/docs/surrealdb/security/authentication) has made this project obsolete. Yay!

## Status

Under leisure development.

### TODO!

1. Write tests (when proof-of-concept is valid) <= Include `db.blueprint` in tests, not in app...?

   - This will make me remember how stuff works after taking a break...

2. Refactor to use adapters for dbService. All FS-DB stuff into respective adapter.

   - `lmdb-store` has compatibility-issues with node 18(? / !)

3. Redo templateService, too complex
4. Implement user registration & update
5. Update JSON-scema to latest AJV implemented draft
6. Secure all string-schema fields by patterns
7. Swap generator to Yeoman? <= Do I even need a generator? -CLI?
8. Publish on Npm

## Tech

- https://www.npmjs.com/package/jsonpath
- https://github.com/BigstickCarpet/json-schema-ref-parser
- https://github.com/epoberezkin/ajv
- https://www.npmjs.com/package/awilix
- https://www.npmjs.com/package/awilix-express
- jSend

## Knowledge

- https://spacetelescope.github.io/understanding-json-schema/basics.html
- http://objectpath.org/reference.html
- https://github.com/pillarjs/understanding-csrf
- https://github.com/auth0/node-jsonwebtoken
- https://stormpath.com/blog/where-to-store-your-jwts-cookies-vs-html5-web-storage

## Tools

- https://jsonschema.net/

## Disclaimer & motivation

This is above all a proof of concept using the technoloigies listed above.

The motivation is to start with minimum CPU-, RAM- and ca\$h-overhead. The database is therefor a simple JSON-file storage, because most DBs are overkill for a small Wordpress-scale CMS. On par with that, this is also an antempt at making something I would love to use when friends ask me if I can help out with a website: Then I can say "Yes, I can, but only if you accept my terms", instead of sending them off to Wordpress (Which I hate to work with), or SquareWixSpace, any of which is pointless when their requirements are so simple.

### Ultimate disclaimer

Use at own risk! This is a pet project, so it is justified according to my internal mental structure.

---

# HttPie

```
http GET :3000/api/inspect/toText
```

NOTE! See the individual routes for more examples.

## Login

```
http --session=~/tmp/session.json :3000/api/users/current
http --session=~/tmp/session.json POST :3000/api/auth/request email=gnimmelf@gmail.com
// Extract <CODE> from reponse
http --session=~/tmp/session.json POST :3000/api/auth/exchange email=gnimmelf@gmail.com code=<CODE>
http --session=~/tmp/session.json :3000/api/users/current
http --session=~/tmp/session.json :3000/api/auths/logout
```
