const fs = require('fs')

class FilesystemService {
    isExists(path) {
        return fs.existsSync(path)
    }

    removeFile(rootDirectory, path) {
        try {
            fs.unlink(`${rootDirectory}/${path}`, err => {
                return err === null;
            })
        } catch (e) {
            throw e
        }
    }
}

module.exports = new FilesystemService()