import { Command } from 'commander';
import configService from "../services/configService.js";
import chalk from "chalk";

const configCommand = new Command('config');

configCommand
    .description('Configure the application settings')
    .action(async (options) => {
        await configService.runWizard(options)

    console.log('🎉 ' + chalk.green('Configuration updated successfully!'));
    });

export default configCommand;
