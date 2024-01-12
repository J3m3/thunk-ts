export const deepCopy = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Array) {
    const copy: unknown[] = [];
    for (let i = 0; i < obj.length; i++) {
      copy[i] = deepCopy(obj[i]);
    }
    return copy as T;
  }

  if (obj instanceof Object) {
    const copy: { [key: string]: unknown } = {};
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        copy[key] = deepCopy(obj[key]);
      }
    }
    return copy as T;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
};
