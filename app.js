const Koa = require('koa')
const router = require('./server/routes')
const logger = require('koa-logger')
const koaBody = require('koa-body')
const port = require('./config').config.port
const app = new Koa

app.use(koaBody({ multipart: true,
    formidable: {
        maxFileSize: 1024 * 1024 * 1024 //1G
    }}))
app.use(logger())
app.use(router.routes())
app.listen(port)
