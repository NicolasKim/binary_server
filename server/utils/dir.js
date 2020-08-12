const fs = require('fs-promise')
const rimraf = require('rimraf')
const path = require('path')

function mkdirp(dirname) {
    return new Promise((resolve, reject) => {
        fs.exists(dirname)
            .then((exists) => {
                if (exists) {
                    resolve()
                } else {
                    mkdirp(path.dirname(dirname))
                        .then(() => {
                            fs.mkdir(dirname).then(() => {
                                resolve()
                            })
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                }
            })
    })
}

function rmdir(dirname) {
    return new Promise((resolve, reject) => {
        rimraf(dirname, (err) => {
            if (err) {
                reject(err)
            } else {
                resolve(resolve)
            }
        })
    })
}

function binaryRoot() {
    const rootDir = path.dirname(require.main.filename)
    const binaryRoot = path.join(rootDir, '.binary')
    return binaryRoot
}


function binaryDir(name, version, tag) {
    return path.join(binaryRoot(), name, version, tag)
}

//HAHA/1.0.0/debug/HAHA.zip
//HAHA/1.0.0/release/HAHA.zip
//归档文件位置
function frameworkDir(name, version, tag, archive_file) {
    return path.join(binaryDir(name, version, tag), archive_file)
}

module.exports = {
    mkdirp,
    rmdir,
    binaryRoot,
    binaryDir,
    frameworkDir
}