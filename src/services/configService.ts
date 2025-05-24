import fs from 'fs';
import inquirer from "inquirer";
import Config, {IpamSubnetConfig, PortMapping, RessourcesPreset} from "../models/Config.js";
import dockerComposeService from "./dockerComposeService.js";
import chalk from "chalk";

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
                type: 'list',
                name: 'os',
                message: 'Select your operating system (note: Only Linux/Ubuntu is currently supported)',
                choices: [
                    {name: 'Linux/Ubuntu', value: 'linux/ubuntu'},
                ],
                default: oldConfig?.os ?? 'linux/ubuntu',
            },
            {
                type: 'list',
                name: 'environment',
                message: 'Select the environment:',
                choices: [
                    {name: 'Development', value: 'dev'},
                    {name: 'Production', value: 'prod'},
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
                    {name: '7.4', value: 7.4},
                    {name: '8.0', value: 8.0},
                    {name: '8.1', value: 8.1},
                    {name: '8.2', value: 8.2, checked: true},
                    {name: '8.3', value: 8.3, checked: true},
                    {name: '8.4', value: 8.4},
                ],
                default: oldConfig?.php_versions ?? [],
            },
            {
                type: 'list',
                name: 'ressources_preset',
                message: 'Select the resource allocation preset:',
                choices: [
                    {name: RessourcesPreset.Micro, value: 'micro'},
                    {name: RessourcesPreset.Small, value: 'small'},
                    {name: RessourcesPreset.Medium, value: 'medium'},
                    {name: RessourcesPreset.Large, value: 'large'},
                ],
                default: oldConfig?.ressources_preset ?? 'small',
            },
        ])

        console.log(chalk.yellow('--- Docker Compose networks ipam subnets ---'))
        console.log('Use a subnet to avoid port conflicts with other services, such as 80, 443, etc.')
        console.log('If you do not want to use a subnet, you will need to select each port binding.')
        console.log('If want to use a subnet, make sure it is not already used by another service on your host machine.')

        const portStrategySelected = (await inquirer.prompt([
            {
                type: 'list',
                name: 'portStrategySelected',
                message: 'Select the port strategy:',
                choices: [
                    {name: 'Use a subnet', value: 'ipam_subnet'},
                    {name: 'Select each port binding', value: 'port_mapping'},
                ],
                default: oldConfig?.ports_strategy ?? 'ipam_subnet',
            }
        ])).portStrategySelected;

        switch (portStrategySelected) {
            case 'ipam_subnet':
                configEdited.ports_strategy = await this.runWizard__createIpamSubnetConfig(oldConfig?.ports_strategy);
                break;
            case 'port_mapping':
                configEdited.ports_strategy = await this.runWizard__createPortMapping(oldConfig?.ports_strategy);
                break;
            default:
                throw new Error(`Unknown port strategy selected: ${portStrategySelected}`);
        }

        this.saveConfig(configEdited);
        dockerComposeService.applyConfig(configEdited);
    }

    async runWizard__createPortMapping(oldPortMapping?: PortMapping): Promise<PortMapping> {

    }

    async runWizard__createIpamSubnetConfig(oldIpamSubnetConfig?: IpamSubnetConfig): Promise<IpamSubnetConfig> {

    }
}

const configService = new ConfigService();
export default configService;