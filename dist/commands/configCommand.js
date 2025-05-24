import { Command } from 'commander';
import configService from "../services/configService";
const configCommand = new Command('config');
configCommand
    .description('Configure the application settings')
    .action((options) => {
    configService.runWizard(options);
});
export default configCommand;
//# sourceMappingURL=configCommand.js.map