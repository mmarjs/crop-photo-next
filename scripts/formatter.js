const util = require('util');
const {execSync} = require('child_process');
const {extname} = require("path");

const exec = util.promisify(require('child_process').exec);
const prettier = require("prettier");


let buffer = execSync("git diff --cached --name-only --diff-filter=ACM");
const files = buffer.toString("utf-8").split("\n");

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", "css", "html"];

function paginate(arr, size) {
  return arr.reduce((acc, val, i) => {
    let idx = Math.floor(i / size)
    let page = acc[idx] || (acc[idx] = [])
    page.push(val)

    return acc
  }, [])
}

let page_size = 10;
let pages = paginate(files, page_size)

for (const page of pages) {
  const batch = [];
  for (const file of page) {
    if (file.startsWith(".")) continue;
    if (!file.startsWith("src")) continue;
    let ext = extname(file);
    if (EXTENSIONS.indexOf(ext.toLowerCase()) === -1) continue;
    batch.push(file);

  }
  if (batch.length > 0) {
    let batchString = batch.join(" ");
    console.log("Formatting file.", batchString);
    const o = execSync("npm run pretty:write --write " + batchString)
    console.log("Formatting file.", batchString, "[DONE]", o.toString("utf-8"));
  }
}


process.exit(0);




