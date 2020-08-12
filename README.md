# Binary-server
Simple binary file server

## Env

- Install mysql
- Start mysql

## Deploy
- npm install
- npm start

## Router

```node
.get('/frameworks', frameworks.show)
.get('/frameworks/:names', frameworks.show)
.get('/frameworks/:name/:version', frameworks.show)
.get('/frameworks/:name/:version/:tag', frameworks.show)
.get('/frameworks/exit/:name/:version/:tag', frameworks.exit)
.del('/frameworks/:name/:version/:tag', frameworks.destroy)
.get('/frameworks/:name/:version/:tag/zip', frameworks.download)
.get('/frameworks/download/:name/:version/:tag/file.zip', frameworks.download)
.post('/frameworks', frameworks.create)
```
Binary zipfile will store at root dir of  `.binary` 
