import { Logger } from "aws-amplify";

class LocalStorageWrapper {
  private readonly lc: Storage | null = null;
  private readonly map: Map<string, string | null> = new Map<string, string>();
  private readonly logger = new Logger("util:storage:LocalStorageWrapper", "DEBUG");

  constructor() {
    this.lc = typeof window !== "undefined" ? window?.localStorage : null;
    if (!this.lc) {
      this.logger.warn("Local storage not present. Using the in memory map.");
    }
  }

  size(): number {
    return this.length;
  }

  get length(): number {
    if (this.lc) return this.lc.length;
    return this.map.size;
  }

  clear(): void {
    if (this.lc) this.lc.clear();
    else this.map.clear();
  }

  getItem(key: string): string | null {
    if (this.lc) return this.lc.getItem(key);
    let v = this.map.get(key);
    if (v) return v;
    return null;
  }

  removeItem(key: string): void {
    if (this.lc) this.lc.removeItem(key);
    else this.map.delete(key);
  }

  setItem(key: string, value: string): void {
    if (this.lc) this.lc.setItem(key, value);
    else this.map.set(key, value);
  }
}

const LocalStorage = new LocalStorageWrapper();

export default LocalStorage;
