import fs from 'fs';
import inquirer from "inquirer";
import { RessourcesPreset } from "../models/Config.js";
class ConfigService {
    constructor() {
        this.configFilePath = '~/.docker-wp-cli/config.json';
        this.configFilePath = this.configFilePath.replace('~', process.env.HOME || process.env.USERPROFILE);
        this.createConfigFileIfNotExists();
    }
    createConfigFileIfNotExists() {
        const directory = this.configFilePath.substring(0, this.configFilePath.lastIndexOf('/'));
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
        if (!fs.existsSync(this.configFilePath)) {
            fs.writeFileSync(this.configFilePath, JSON.stringify({}));
        }
    }
    saveConfig(config) {
        fs.writeFileSync(this.configFilePath, JSON.stringify(config, null, 2));
    }
    async runWizard(options) {
        const oldConfig = JSON.parse(fs.readFileSync(this.configFilePath, 'utf-8'));
        const configEdited = await inquirer.prompt([
            {
                type: 'list',
                name: 'environment',
                message: 'Select the environment:',
                choices: [
                    { name: 'Development', value: 'dev' },
                    { name: 'Production', value: 'prod' },
                ],
                default: oldConfig?.environment ?? 'dev',
            },
            {
                type: 'input',
                name: 'sites_root_dir',
                message: 'Enter the WordPress root websites directory:',
                default: oldConfig?.sites_root_dir ?? '',
            },
            {
                type: 'checkbox',
                name: 'php_versions',
                message: 'Select the PHP versions you want to use:',
                choices: [
                    { name: '7.4', value: 7.4 },
                    { name: '8.0', value: 8.0 },
                    { name: '8.1', value: 8.1 },
                    { name: '8.2', value: 8.2, checked: true },
                    { name: '8.3', value: 8.3, checked: true },
                    { name: '8.4', value: 8.4 },
                ],
                default: oldConfig?.php_versions ?? [],
            },
            {
                type: 'list',
                name: 'ressources_preset',
                message: 'Select the resource allocation preset:',
                choices: [
                    { name: RessourcesPreset.Micro, value: 'micro' },
                    { name: RessourcesPreset.Small, value: 'small' },
                    { name: RessourcesPreset.Medium, value: 'medium' },
                    { name: RessourcesPreset.Large, value: 'large' },
                ],
                default: oldConfig?.ressources_preset ?? 'small',
            },
        ]);
        this.saveConfig(configEdited);
    }
}
const configService = new ConfigService();
export default configService;
//# sourceMappingURL=configService.js.map