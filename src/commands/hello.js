import program from "../commander.js";

program
    .command('test')
    .description('Simple test command')
    .option('-m, --message <msg>', 'Message to display', 'Hello world')
    .action((options) => {
        console.log(`Test command executed with message: ${options.message}`);
    });