// Messages.importMessagesDirectory(__dirname);
// const messages = Messages.loadMessages('siri', 'messages');

export class Common {
  public static cwd: string = process.cwd();

  public static wait(ms: number): Promise<unknown> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
