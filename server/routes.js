const frameworks = require('./controllers/frameworks')
const Router = require('koa-router')
const router = new Router

router
    .get('/frameworks', frameworks.show)
    .get('/frameworks/:names', frameworks.show)
    .get('/frameworks/:name/:version', frameworks.show)
    .get('/frameworks/:name/:version/:tag', frameworks.show)
    .get('/frameworks/exit/:name/:version/:tag', frameworks.exit)
    .del('/frameworks/:name/:version/:tag', frameworks.destroy)
    .get('/frameworks/:name/:version/:tag/zip', frameworks.download)
    .get('/frameworks/download/:name/:version/:tag/file.zip', frameworks.download)
    .post('/frameworks', frameworks.create)

module.exports = router