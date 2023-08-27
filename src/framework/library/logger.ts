import chalk from "chalk";

export class Logger {
  name = "[Sanity Composer]";
  moduleName: string | undefined;

  level = 0;
  levels = {
    log: 1,
    warn: 2,
    error: 3,
  };

  constructor(name?: string) {
    this.moduleName = name;
    
  }

  get prefix() {
    return [chalk.bold(chalk.blue(this.name)), this.moduleName ? chalk.blue(`[${this.moduleName}]`) : undefined]
      .filter(Boolean)
      .join(" ");
  }

  setLogLevel(level: "log" | "warn" | "error") {
    this.level = this.levels[level];
    return this
  }
  log(...args: any[]) {
    if (this.level > 0) return;
    console.log(this.prefix, ...args);
  }
}
