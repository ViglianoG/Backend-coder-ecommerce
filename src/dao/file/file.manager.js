import fs from "fs"

class FileManager {

    constructor(path) {
        this.path = path
    }

    read = () => {
        if (fs.existsSync(this.path)) {
            return fs.promises.readFile(this.path, "utf-8").then(r => JSON.parse(r))
        }
        return []
    }

    write = list => {
        return fs.promises.writeFile(this.path, JSON.stringify(list))
    }

    getNextID = list => {
        const count = list.length
        return (count > 0) ? list[count - 1].id + 1 : 1
    }

    get = async () => {
        const data = await this.read()

        return data
    }

    getOneByParam = async (param, value) => {
        const data = await this.read()
        const obj = data.find(d => d[param] == value)

        return obj
    }

    create = async (obj) => {
        const list = await this.read()
        obj.id = this.getNextID(list)

        list.push(obj)

        await this.write(list)
    }

    update = async (id, obj) => {
        obj.id = id
        const list = await this.read()

        for (let i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                list[i] = obj
                break
            }
        }

        await this.write(list)

        return obj
    }



}

export default FileManager