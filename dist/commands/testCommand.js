import { Command } from 'commander';
const testCommand = new Command('test');
testCommand
    .description('Simple testCommand command')
    .option('-m, --message <msg>', 'Message to display', 'Hello world')
    .action((options) => {
    console.log(`Test command executed with message: ${options.message}`);
});
export default testCommand;
//# sourceMappingURL=testCommand.js.map