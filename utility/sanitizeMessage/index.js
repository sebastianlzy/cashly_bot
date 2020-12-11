module.exports = (msg) => {
    try {
        return msg.replace(/[-[\]_{}()*+?.,!\\^$|#\s]/g, '\\$&')
    } catch(e) {
        console.error("ERROR in sanitizeMSG", e)
    }

    return msg
}