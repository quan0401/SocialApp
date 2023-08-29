export class Helpers {
  static firstLetterUppercase(str: string): string {
    const valueString = str.toLowerCase();
    return valueString
      .split(' ')
      .map((value) => `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`)
      .join(' ');
  }
  static lowerCase(str: string): string {
    return str.toLowerCase();
  }
  static generateRandomIntegers(intergeLength: number): number {
    const charaters = '0123456789';
    let result = ' ';
    const characterLength = charaters.length;
    for (let i = 0; i < intergeLength; i++) {
      result += charaters.charAt(Math.floor(Math.random() * characterLength));
    }
    return parseInt(result, 10);
  }
  static parseJson(prop: any) {
    try {
      return JSON.parse(prop);
    } catch (error) {
      return prop;
    }
  }
  static isDataUrl(value: string): boolean {
    const dataUrlRegex: RegExp =
      /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\\/?%\s]*)\s*$/i;
    return dataUrlRegex.test(value);
  }
}
