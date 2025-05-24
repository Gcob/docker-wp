import testCommand from './testCommand';
import configCommand from './configCommand';
export default function registerCommands(program) {
    program.addCommand(testCommand);
    program.addCommand(configCommand);
}
//# sourceMappingURL=index.js.map