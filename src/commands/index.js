import testCommand from './test.js';

export default function registerCommands(program) {
    program.addCommand(testCommand);
}
