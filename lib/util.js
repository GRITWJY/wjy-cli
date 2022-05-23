const ora = require("ora")

/**
 * sleep 函数
 * @param n
 */
function sleep(n) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, n)
    })
}

/**
 *
 * @param message
 * @param fn
 * @param args
 * @returns {Promise<void>}
 */
async function loading(message, fn, ...args) {
    const spinner = ora(message)
    spinner.start()
    try {
        let executeRes = await fn(...args)
        spinner.succeed()
        return executeRes;
    } catch (error) {
        // 加载失败
        spinner.fail("request fail, fetching")
        await sleep(1000)
        return loading(message, fn, ...args)
    }

}

module.exports = {
    loading
}