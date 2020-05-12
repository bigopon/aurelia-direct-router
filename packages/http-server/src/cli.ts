import { DebugConfiguration } from '@aurelia/debug';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { HttpServerOptions, parseServerOptions } from './server-options';
import { DI } from '@aurelia/kernel';
import { RuntimeNodeConfiguration } from './configuration';
import { IHttpServer } from './interfaces';

const cwd = process.cwd();
function parseArgs(args: string[]): null | HttpServerOptions {
  const cmd = args[0];
  if (cmd === 'help') { return null; }

  const configuration: HttpServerOptions = new HttpServerOptions();
  if (args.length % 2 === 1) {
    // check for configuration file
    const configurationFile = resolve(cwd, args[0]);
    if (!existsSync(configurationFile)) {
      throw new Error(`Configuration file is missing or uneven amount of args: ${args}. Args must come in pairs of --key value`);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
      configuration.applyConfig(require(configurationFile));
      args = args.slice(1);
    }
  }

  const { options, unconsumedArgs } = parseServerOptions(cwd, args);

  if (unconsumedArgs.length > 0) {
    console.warn(`Following arguments are not consumed ${unconsumedArgs.join(',')}`);
  }
  return options;
}

(async function () {
  DebugConfiguration.register();

  const parsed = parseArgs(process.argv.slice(2));
  if (parsed === null) {
    console.log(new HttpServerOptions().toString());
  } else {
    const container = DI.createContainer();
    container.register(RuntimeNodeConfiguration.create(parsed));
    const server = container.get(IHttpServer);
    await server.start();
  }
})().catch(err => {
  console.error(err);
  process.exit(1);
});
