import testCommand from './testCommand.js';
import configCommand from './configCommand.js';

export default function registerCommands(program) {
    program.addCommand(testCommand);
    program.addCommand(configCommand);
}
