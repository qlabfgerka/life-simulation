import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor() {}

  public getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  public getRandomHexColor(): string {
    return '#000000'.replace(/0/g, function () {
      return (~~(Math.random() * 16)).toString(16);
    });
  }
}
