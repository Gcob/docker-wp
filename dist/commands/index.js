import testCommand from './testCommand.js';
import configCommand from './configCommand.js';
export default function registerCommands(program) {
    program.addCommand(testCommand);
    program.addCommand(configCommand);
}
export async function catchSIGINT(fn) {
    try {
        await fn();
    }
    catch (error) {
        if (error.message?.includes('SIGINT')) {
            console.log('👋 Bye');
            process.exit(0);
        }
        else {
            throw error;
        }
    }
}
//# sourceMappingURL=index.js.map