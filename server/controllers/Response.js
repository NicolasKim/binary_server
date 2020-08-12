
class ResponseStatus {
    constructor(code, msg){
        this.code = code
        this.msg= msg
    }
}

class ResponseData {
    constructor(status, data){
        this.status = status
        this.data= data
    }
}

module.exports = {
    ResponseData,
    ResponseStatus
}