export class CommonHelper {
  public static getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  public static getRandomHexColor(): string {
    return '#000000'.replace(/0/g, function () {
      return (~~(Math.random() * 16)).toString(16);
    });
  }
}
