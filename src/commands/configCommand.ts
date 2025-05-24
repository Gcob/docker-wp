import {Command} from 'commander';
import configService from "../services/configService.js";
import chalk from "chalk";
import dockerComposeService from "../services/dockerComposeService.js";
import {catchSIGINT} from "./index.js";

const configCommand = new Command('config');

configCommand
    .description('Configure the application settings')
    .action(async (options) => {
        await catchSIGINT(async () => {
            const config = await configService.runWizard(options)
            await dockerComposeService.applyConfig(config);

            console.log('🎉 ' + chalk.green('Configuration updated successfully!'));
            console.log(chalk.dim('Consider restarting the application to apply changes. Run `dwpc restart` to do so.'));
        });
    });

export default configCommand;
