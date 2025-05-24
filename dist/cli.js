#!/usr/bin/env node
import { Command } from 'commander';
import registerCommands from './commands/index.js';
const program = new Command();
program
    .name('dwpc')
    .description('Run multiple WordPress sites using nginx, php-fpm, mariadb and docker-compose.')
    .version('1.0.0');
registerCommands(program);
program.parse(process.argv);
//# sourceMappingURL=cli.js.map