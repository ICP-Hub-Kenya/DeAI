import { IDL, query, update } from "azle";

export default class {
  message: string = "Hello,";
  count: number = 9999;
  ideas: string[] = [];

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
  @update([IDL.Text], IDL.Bool)
  saveIDea(idea: string): boolean {
    try {
      this.ideas.push(idea);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  @query([], IDL.Vec(IDL.Text))
  getIDeas(): string[] {
    try {
      return this.ideas;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}
