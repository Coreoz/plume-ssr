import minimist, { ParsedArgs } from 'minimist';

/**
 * Parse les arguments de la ligne de commande utilisés pour le lancement du serveur
 */
export class ProgramArguments {
  private readonly args: ParsedArgs;

  constructor() {
    this.args = minimist(process.argv.slice(2));
  }

  getArgs() {
    return this.args;
  }
}
