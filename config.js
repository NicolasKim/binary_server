// const config = {
//     database: {
//         name: 'binary_server',// 数据库名
//         username: 'root',
//         password: 'aA111111',
//         host: 'localhost',
//         port: '3306',
//         dialect: 'mysql',
//         pool: {
//             max: 5,
//             min: 0,
//             acquire: 30000,
//             idle: 10000
//         }
//     },
//     port: 8094
// }

const config = {
    database: {
        name: 'binary_info',// 数据库名
        username: 'root',
        password: 'dreamtracer',
        host: '127.0.0.1',
        port: '3306',
        dialect: 'mysql',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    port: 8080
}

module.exports = {
    config
}
