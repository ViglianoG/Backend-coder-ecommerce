import {fileURLToPath} from "url"
import {dirname} from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default __dirname

//solo funciona con el "type": "module" en el package.json