import fs from 'fs';
import inquirer from "inquirer";

class ConfigService {
    configFilePath = '~/.docker-wp-cli/config.json';

    constructor() {
        this.configFilePath = this.configFilePath.replace('~', process.env.HOME || process.env.USERPROFILE);
        this.createFileIfNotExists();
    }

    createFileIfNotExists() {
        const directory = this.configFilePath.substring(0, this.configFilePath.lastIndexOf('/'));

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, {recursive: true});
        }

        if (!fs.existsSync(this.configFilePath)) {
            fs.writeFileSync(this.configFilePath, JSON.stringify({}));
        }
    }

    runWizard(options) {
        const questions = [
            {
                type: 'input',
                name: 'dockerHost',
                message: 'Enter Docker host (default: unix:///var/run/docker.sock):',
                default: 'unix:///var/run/docker.sock'
            },
        ];

        inquirer.prompt(questions).then(answers => {
            this.saveConfig(answers);
            console.log('Configuration saved successfully.');
        });
    }
}

const configService = new ConfigService();
export default configService;