let process = require("process");
const {argv} = process;
const fs = require("fs")
const util = require('util');
const exec = util.promisify(require('child_process').exec);

let envName = process.env.BUILD_ENV;

if (!envName) {
  envName = "daisy"
  console.warn("Environment \"BUILD_ENV\" is not found. Defaulting to daisy env.");
}

const prefixForProperties = "/" + envName;
console.info("Using prefix: ", prefixForProperties)

let inputFile = ".env.production"

const contents = fs.readFileSync(inputFile, "utf-8");
let lines = contents.split(/\r?\n/);
//Pruning the lines which starts with #
lines = lines.filter(line => !line.startsWith("#"));
/**
 *
 * @type {Map<string, string>}
 */
const map = new Map();
for (const line of lines) {
  let split = line.split("=");
  let property = split[0].trim();
  let value = split[1].trim();
  map.set(property, value);
}

async function fetchValueFromAwsParameterStore(key) {
  let keyWithPrefix = `${prefixForProperties}/${key}`;

  const {stdout, stderr} = await exec(
    "aws " +
    "--output=json " +
    "ssm " +
    "get-parameters " +
    "--names " + keyWithPrefix + " --query \"Parameters[*].{Name:Name,Value:Value}\"");
  if (!stderr && stderr.trim().length > 0) {
    console.error("Error", stderr.length, stderr);
    throw new Error(stderr);
  }
  console.info("Received response for key:", keyWithPrefix, "value:", stdout);
  let jsonResults = JSON.parse(stdout);
  let result = jsonResults[0];
  if (result['Value']) {
    return result.Value;
  } else {
    const error = `Failed to read value for key ${keyWithPrefix} Received value: ${stdout}`;
    console.error(error);
    throw new Error(error);
  }
}

/**
 *
 * @param propertiesMap{Map<string, string>}
 * @returns {Promise<Map<string, string>>}
 */
async function processProperties(propertiesMap) {
  for (const property of propertiesMap.keys()) {
    /**
     * @type {string}
     */
    const value = map.get(property);
    if (value.startsWith("$")) {
      let valueKey = value.substring(2, value.length - 1);
      let split = valueKey.split(":");
      let nameSpace = split[0];
      let keyInNameSpace = split[1];
      if (nameSpace === "ssm") {
        let valueFromAwsParameterStore = await fetchValueFromAwsParameterStore(keyInNameSpace);
        propertiesMap.set(property, valueFromAwsParameterStore);
      } else if (nameSpace === "env") {
        propertiesMap.set(property, process.env[keyInNameSpace]);
      } else {
        console.error(`Invalid namespace: ${nameSpace} for the property: ${property}=${value}`);
      }
    }
  }
  return propertiesMap;
}


processProperties(map).then((processedMap) => {
  console.info("Writing modified properties to .env.local...")
  let content = "#" + new Date().toISOString() + "\n\n";
  for (const key of processedMap.keys()) {
    content = content + `${key}=${processedMap.get(key)}\n`;
  }
  fs.writeFileSync('.env.local', content);
  console.info("Successfully written .env.local");
}).catch((error) => {
  console.log(error);
  process.exit(1);
})
