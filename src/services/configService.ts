import fs from 'fs';
import inquirer from "inquirer";
import Config from "../models/Config";

class ConfigService {
    configFilePath = '~/.docker-wp-cli/config.json';

    constructor() {
        this.configFilePath = this.configFilePath.replace('~', process.env.HOME || process.env.USERPROFILE);
        this.createConfigFileIfNotExists();
    }

    createConfigFileIfNotExists() {
        const directory = this.configFilePath.substring(0, this.configFilePath.lastIndexOf('/'));

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, {recursive: true});
        }

        if (!fs.existsSync(this.configFilePath)) {
            fs.writeFileSync(this.configFilePath, JSON.stringify({}));
        }
    }

    saveConfig(config: Config) {
        fs.writeFileSync(this.configFilePath, JSON.stringify(config, null, 2));
    }

    async runWizard(options) {
        const oldConfig = JSON.parse(fs.readFileSync(this.configFilePath, 'utf-8'));

        const configEdited: Config = await inquirer.prompt([
            {
                type: 'input',
                name: 'sites_root_dir',
                message: 'Enter the WordPress root websites directory:',
                default: oldConfig?.sites_root_dir ?? '',
            },
        ])

        this.saveConfig(configEdited);
    }
}

const configService = new ConfigService();
export default configService;