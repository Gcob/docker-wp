import {Command} from "commander";

const program = new Command();

program
    .name('dwpc')
    .description('Run multiple WordPress sites using nginx, php-fpm, mariadb and docker-compose.')
    .version('1.0.0');

program
    .command('test')
    .description('Simple test command')
    .option('-m, --message <msg>', 'Message to display', 'Hello world')
    .action((options) => {
        console.log(`Test command executed with message: ${options.message}`);
    });

program.parse(process.argv);
export default program;