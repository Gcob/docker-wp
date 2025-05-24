import { Command } from 'commander';

const test = new Command('test');

test
    .description('Simple test command')
    .option('-m, --message <msg>', 'Message to display', 'Hello world')
    .action((options) => {
        console.log(`Test command executed with message: ${options.message}`);
    });

export default test;
