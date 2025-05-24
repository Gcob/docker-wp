import { Command } from 'commander';
import configService from "../services/configService.js";

const configCommand = new Command('config');

configCommand
    .description('Configure the application settings')
    .action((options) => {
        configService.runWizard(options)
    });

export default configCommand;
