import { IDL, query, update } from "azle";

export default class {
  message: string = "Hello,";
  count: number = 9999;

  @query([], IDL.Int32)
  getCount(): number {
    return this.count;
  }

  @query([IDL.Text], IDL.Text)
  greet(name: string): string {
    return `${this.message} ${name}!`;
  }

  @update([IDL.Text])
  setMessage(message: string): void {
    this.message = message;
  }
}
