'use strict'

const components = require('../models/component')
const dir = require('../utils/dir')
const path = require('path')
const fs = require('fs')
const fsp = require('fs-promise')
const util = require('util')
const resp = require('./Response')

async function show(ctx) {
    const name = ctx.params.name
    const version = ctx.params.version
    const tag = ctx.params.tag
    let conditions = {}

    if (name && version) {
        conditions = { name: name, version: version }
    }

    if (name && version && tag) {
        conditions = { name: name, version: version, tag: tag}
    }

    let infos = await components.BinaryInfo.findAll({
        where: conditions
    });

    ctx.type = 'application/json'
    if (infos.length === 0) {
        const status = new resp.ResponseStatus(404, "文件不存在")
        const data = new resp.ResponseData(status, {})
        ctx.body = JSON.stringify(data)
        return
    }
    if (name && version && tag) {
        let one = {
            name: infos[0].name,
            version: infos[0].version,
            tag: infos[0].tag,
            stable: infos[0].stable,
            download_url: util.format('/frameworks/download/%s/%s/%s/file.zip', infos[0].name, infos[0].version, infos[0].tag)
        }
        const status = new resp.ResponseStatus(0, "")
        const data = new resp.ResponseData(status, one)
        ctx.body = JSON.stringify(data)
    } else {
        var results = [];
        for (const i in infos) {
            // let name = infos[i].name
            // body[name] = body[name] || []
            // body[name].push(infos[i].version)

            let one = {
                name: infos[i].name,
                version: infos[i].version,
                tag: infos[i].tag,
                stable: infos[i].stable,
                download_url: util.format('/frameworks/download/%s/%s/%s/file.zip', infos[i].name, infos[i].version, infos[i].tag)
            }

            results.push(one)
        }

        const status = new resp.ResponseStatus(0, "")
        const data = new resp.ResponseData(status, results)
        ctx.body = JSON.stringify(data)
    }

}

async function exit(ctx) {
    const name = ctx.params.name
    const version = ctx.params.version
    const tag = ctx.params.tag

    var conditions = {name: name, version: version, tag: tag}

    let infos = await components.BinaryInfo.findAll({
        where: conditions
    });

    //设置contentType
    ctx.type = 'application/json'

    if (infos.length > 0) {
        const status = new resp.ResponseStatus(0, util.format('二进制文件存在 %s - %s - %s', name, version, tag))
        const data = new resp.ResponseData(status, true)
        ctx.body = JSON.stringify(data)
    } else {
        const status = new resp.ResponseStatus(0, util.format('二进制文件不存在', name, version, tag))
        const data = new resp.ResponseData(status, false)
        ctx.body = JSON.stringify(data)
    }
}

async function create(ctx) {

    const name = ctx.request.body.fields.name
    const version = ctx.request.body.fields.version
    const tag = ctx.request.body.fields.tag
    let stable = false;
    if (tag === "release") {
        stable = true
    }

    const binaryDir = dir.binaryDir(name, version, tag)
    if (!fs.existsSync(binaryDir)) {
        await dir.mkdirp(binaryDir)
    }

    const file = ctx.request.body.files.file

    let info = await components.BinaryInfo.findOne({
        where: {name: name, version: version, tag: tag}
    })
    //设置contentType
    ctx.type = 'application/json'

    if (info) {
        const status = new resp.ResponseStatus(500, util.format('二进制文件已经存在 %s - %s - %s', name, version, tag))
        const data = new resp.ResponseData(status, null)
        ctx.body = JSON.stringify(data)
        return
    }

    const filePath = path.join(binaryDir, file.name)
    const reader = fs.createReadStream(file.path)
    const writer = fs.createWriteStream(filePath)
    reader.pipe(writer)

    try {
        await components.BinaryInfo.create({name: name, tag: tag, version: version, archive_file: file.name, stable: stable})
    } catch (error) {
        ctx.response.status = 500;
        const status = new resp.ResponseStatus(error.code, error.message)
        const data = new resp.ResponseData(status, null)
        ctx.body = JSON.stringify(data)
        return
    }
    const status = new resp.ResponseStatus(0, "保存成功")
    const data = new resp.ResponseData(status, {
        name: name,
        version: version,
        tag: tag,
        stable: stable,
        download_url: util.format('/frameworks/download/%s/%s/%s/file.zip', name, version, tag)
    })

    ctx.body = JSON.stringify(data)
    // ctx.body = util.format('保存成功 %s (%s)', name, version)
}

async function destroy(ctx) {
    const name = ctx.params.name
    const version = ctx.params.version
    const tag = ctx.params.tag
    let info = await components.BinaryInfo.findOne({
        where: {name: name, version: version, tag: tag}
    })
    if (!info) {
        ctx.response.status = 404;
        const status = new resp.ResponseStatus(1, '二进制文件不存在')
        const data = new resp.ResponseData(status, null)
        ctx.body = JSON.stringify(data)
        return
    }

    const binaryDir = dir.binaryDir(name, version, tag)
    if (fs.existsSync(binaryDir)) {
        await dir.rmdir(binaryDir)
    }

    try {
        await components.BinaryInfo.destroy({
            where: {name: name, version: version, tag: tag}
        })
    } catch (error) {
        ctx.response.status = 404;
        const status = new resp.ResponseStatus(error.code, error.message)
        const data = new resp.ResponseData(status, null)
        ctx.body = JSON.stringify(data)
        return
    }
    ctx.response.status = 200;
    const status = new resp.ResponseStatus(0, '删除成功')
    const data = new resp.ResponseData(status, null)
    ctx.body = JSON.stringify(data)
}

async function download(ctx) {
    const name = ctx.params.name
    const version = ctx.params.version
    const tag = ctx.params.tag
    let info = await components.BinaryInfo.findOne({
        where: {name: name, version: version, tag: tag}
    })

    if (!info) {
        ctx.status = 404
        const status = new resp.ResponseStatus(404, util.format('无二进制文件 %s %s %s', name, version, tag))
        const data = new resp.ResponseData(status, null)
        ctx.body = JSON.stringify(data)
        return
    }

    const frameworkDir = dir.frameworkDir(name, version, tag, info.archive_file)
    const binaryFile = await fsp.readFile(frameworkDir)
    if (!binaryFile) {
        ctx.status = 404
        const status = new resp.ResponseStatus(404, util.format('无二进制文件 %s %s %s', name, version, tag))
        const data = new resp.ResponseData(status, null)
        ctx.body = JSON.stringify(data)
        return
    }

    ctx.type = path.extname(frameworkDir)
    ctx.body = fs.createReadStream(frameworkDir)

    ctx.set('Content-disposition', 'attachment; filename= '+path.basename(frameworkDir))
}

async function download_dsym(ctx) {
    const name = ctx.params.name
    const version = ctx.params.version
    const tag = ctx.params.tag
    let info = await components.dSYMInfo.findOne({
        where: {name: name, version: version, tag: tag}
    })

    if (!info) {
        ctx.status = 404
        const status = new resp.ResponseStatus(404, util.format('无二进制文件 %s %s %s', name, version, tag))
        const data = new resp.ResponseData(status, null)
        ctx.body = JSON.stringify(data)
        return
    }

    const dsymFilePath = dir.dSYMFile(name, version, tag, info.archive_file)
    const dsymFile = await fsp.readFile(dsymFilePath)
    if (!dsymFile) {
        ctx.status = 404
        const status = new resp.ResponseStatus(404, util.format('无二进制文件 %s %s %s', name, version, tag))
        const data = new resp.ResponseData(status, null)
        ctx.body = JSON.stringify(data)
        return
    }

    ctx.type = path.extname(dsymFilePath)
    ctx.body = fs.createReadStream(dsymFilePath)

    ctx.set('Content-disposition', 'attachment; filename= '+path.basename(dsymFilePath))
}

async function upload_dsym(ctx) {

    const name = ctx.request.body.fields.name
    const version = ctx.request.body.fields.version
    const tag = ctx.request.body.fields.tag
    // let stable = false;
    // if (tag === "release") {
    //     stable = true
    // }

    const dSYMDir = dir.dSYMDir(name, version, tag)
    if (!fs.existsSync(dSYMDir)) {
        await dir.mkdirp(dSYMDir)
    }

    const file = ctx.request.body.files.file

    let info = await components.dSYMInfo.findOne({
        where: {name: name, version: version, tag: tag}
    })
    //设置contentType
    ctx.type = 'application/json'

    if (info) {
        const status = new resp.ResponseStatus(500, util.format('dSYM已经存在 %s - %s - %s', name, version, tag))
        const data = new resp.ResponseData(status, null)
        ctx.body = JSON.stringify(data)
        return
    }

    const filePath = path.join(dSYMDir, file.name)
    const reader = fs.createReadStream(file.path)
    const writer = fs.createWriteStream(filePath)
    reader.pipe(writer)

    try {
        await components.dSYMInfo.create({name: name, tag: tag, version: version, archive_file: file.name, stable: true})
    } catch (error) {
        ctx.response.status = 500;
        const status = new resp.ResponseStatus(error.code, error.message)
        const data = new resp.ResponseData(status, null)
        ctx.body = JSON.stringify(data)
        return
    }
    const status = new resp.ResponseStatus(0, "保存成功")
    const data = new resp.ResponseData(status, {
        name: name,
        version: version,
        tag: tag,
        stable: true,
        download_url: util.format('/dsyms/download/%s/%s/%s/file.zip', name, version, tag)
    })

    ctx.body = JSON.stringify(data)
    // ctx.body = util.format('保存成功 %s (%s)', name, version)
}


module.exports = {
    show,
    create,
    destroy,
    download,
    exit,
    download_dsym,
    upload_dsym
}