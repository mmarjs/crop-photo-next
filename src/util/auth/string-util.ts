export function toKeyValue(value: string) {
  const lines = value.split("\n");
  const map: Map<string, string> = new Map();
  for (let i = 0; i < lines.length; i++) {
    const string = lines[i];
    if (string) {
      const words = string.trim().split(":");
      map.set(words[0].trim(), words[1].trim());
    }
  }
  return map;
}

const validateNumberField = (myNumber: string) => {
  const numberRegEx = /\-?\d*\.?\d{1,2}/;
  return numberRegEx.test(myNumber.toLowerCase());
};
export function isValidNumber(value: string) {
  const isValid = !value || validateNumberField(value);
  return isValid;
}
