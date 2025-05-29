import fs from 'fs';
import inquirer from "inquirer";
import GeneralConfig, {IpamSubnetConfig, PortMapping, RessourcesPreset} from "../models/GeneralConfig.js";
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

    saveConfig(config: GeneralConfig) {
        fs.writeFileSync(this.configFilePath, JSON.stringify(config, null, 2));
    }

    getConfig(): GeneralConfig {
        if (!fs.existsSync(this.configFilePath)) {
            throw new Error(`Configuration file not found at ${this.configFilePath}`);
        }

        const configContent = fs.readFileSync(this.configFilePath, 'utf-8');

        try {
            return JSON.parse(configContent);
        } catch (error) {
            throw new Error(`Failed to parse configuration file: ${error.message}`);
        }
    }

    async runWizard(options): Promise<GeneralConfig> {
        const oldConfig = JSON.parse(fs.readFileSync(this.configFilePath, 'utf-8'));

        const configEdited: GeneralConfig = await inquirer.prompt([
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
                filter: (input) => {
                    return input ? input.trim() : '';
                },
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
                type: 'input',
                name: 'mariadb_root_password',
                message: 'Enter the MariaDB root password (leave empty to allow no password):',
                default: oldConfig?.mariadb_root_password ?? '',
                filter: (input) => {
                    return input ? input.trim() : undefined;
                }
            },
        ])

        await this.runWizard__checkAndCreateRootDir(configEdited.sites_root_dir);

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
        return configEdited;
    }

    async runWizard__createPortMapping(oldPortMapping?: PortMapping): Promise<PortMapping> {
        console.log(chalk.yellow('\n--- Port Mapping Configuration ---'));
        console.log('Configure which ports to bind to your host machine.');
        console.log('Leave empty to disable a service (it won\'t be accessible from the host).');

        const portMapping = new PortMapping();

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'http',
                message: 'HTTP port (for web server):',
                default: oldPortMapping?.http?.toString() ?? '80',
                validate: (input) => {
                    if (!input) return 'HTTP port is required';
                    const port = parseInt(input);
                    if (isNaN(port) || port < 1 || port > 65535) {
                        return 'Please enter a valid port number (1-65535)';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'https',
                message: 'HTTPS port (leave empty to disable HTTPS):',
                default: oldPortMapping?.https?.toString() ?? '443',
                validate: (input) => {
                    if (!input) return true; // HTTPS is optional
                    const port = parseInt(input);
                    if (isNaN(port) || port < 1 || port > 65535) {
                        return 'Please enter a valid port number (1-65535)';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'mysql',
                message: 'MySQL port (leave empty to disable external MySQL access):',
                default: oldPortMapping?.mysql?.toString() ?? '3306',
                validate: (input) => {
                    if (!input) return true; // MySQL external access is optional
                    const port = parseInt(input);
                    if (isNaN(port) || port < 1 || port > 65535) {
                        return 'Please enter a valid port number (1-65535)';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'phpmyadmin',
                message: 'phpMyAdmin port (leave empty to disable phpMyAdmin):',
                default: oldPortMapping?.phpmyadmin?.toString() ?? '3307',
                validate: (input) => {
                    if (!input) return true; // phpMyAdmin is optional
                    const port = parseInt(input);
                    if (isNaN(port) || port < 1 || port > 65535) {
                        return 'Please enter a valid port number (1-65535)';
                    }
                    return true;
                }
            }
        ]);

        // Set the port values, converting to numbers or undefined
        portMapping.http = parseInt(answers.http);
        portMapping.https = answers.https ? parseInt(answers.https) : undefined;
        portMapping.mysql = answers.mysql ? parseInt(answers.mysql) : undefined;
        portMapping.phpmyadmin = answers.phpmyadmin ? parseInt(answers.phpmyadmin) : undefined;

        console.log(chalk.green('\n✅ Port mapping configuration completed:'));
        console.log(`   HTTP: ${portMapping.http}`);
        if (portMapping.https) console.log(`   HTTPS: ${portMapping.https}`);
        if (portMapping.mysql) console.log(`   MySQL: ${portMapping.mysql}`);
        if (portMapping.phpmyadmin) console.log(`   phpMyAdmin: ${portMapping.phpmyadmin}`);

        return portMapping;
    }

    async runWizard__createIpamSubnetConfig(oldIpamSubnetConfig?: IpamSubnetConfig): Promise<IpamSubnetConfig> {
        console.log(chalk.yellow('\n--- IPAM Subnet Configuration ---'));
        console.log('Configure a dedicated /30 subnet for your Docker containers.');
        console.log('A /30 subnet provides exactly 2 usable IP addresses, which is perfect for this setup.');
        console.log('This allows containers to use standard ports (80, 443, etc.) without conflicts.');
        console.log('Common /30 subnet examples:');
        console.log('  - 192.168.100.0/30 (IPs: 192.168.100.1, 192.168.100.2)');
        console.log('  - 172.20.0.0/30 (IPs: 172.20.0.1, 172.20.0.2)');
        console.log('  - 10.0.1.0/30 (IPs: 10.0.1.1, 10.0.1.2)');
        console.log('  - 172.30.0.0/30 (IPs: 172.30.0.1, 172.30.0.2)');

        let ipamConfig: IpamSubnetConfig;
        let isValid = false;

        while (!isValid) {
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'subnet',
                    message: 'Enter the /30 subnet in CIDR notation (e.g., 172.20.0.0/30):',
                    default: oldIpamSubnetConfig?.subnet ?? '192.168.100.0/30',
                    validate: (input) => {
                        if (!input) return 'Subnet is required';
                        if (!input.endsWith('/30')) {
                            return 'Please enter a /30 subnet (e.g., 192.168.100.0/30)';
                        }
                        if (!IpamSubnetConfig.validate(input)) {
                            return 'Please enter a valid /30 CIDR notation (e.g., 192.168.100.0/30)';
                        }
                        return true;
                    }
                },
            ]);

            try {
                ipamConfig = IpamSubnetConfig.create(answers.subnet);
                isValid = true;
            } catch (error) {
                console.log(chalk.red(`❌ Error: ${error.message}`));
                console.log(chalk.yellow('Please try again with a different subnet.'));

                const retry = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'retry',
                        message: 'Do you want to try again?',
                        default: true
                    }
                ]);

                if (!retry.retry) {
                    throw new Error('Subnet configuration cancelled by user');
                }
            }
        }

        console.log(chalk.green('\n✅ IPAM subnet configuration completed:'));
        console.log(`   Subnet: ${ipamConfig.subnet}`);
        console.log(`   Gateway: ${ipamConfig.gateway}`);

        console.log(chalk.yellow('\n⚠️  Important notes:'));
        console.log('   - /30 subnets provide exactly 2 usable IP addresses (perfect for small setups)');
        console.log('   - Make sure this subnet doesn\'t conflict with your existing network');
        console.log('   - Containers will be accessible via their container IPs within this subnet');
        console.log('   - Use docker network ls and docker network inspect to check for conflicts');

        return ipamConfig;
    }

    private async runWizard__checkAndCreateRootDir(sites_root_dir: string) {
        if (!sites_root_dir) {
            throw new Error('The WordPress root websites directory cannot be empty.');
        }

        const fullPath = sites_root_dir.replace('~', process.env.HOME || process.env.USERPROFILE);

        if (fs.existsSync(fullPath)) {
            return
        }

        const createDir = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'createDir',
                message: `The directory ${fullPath} does not exist. Do you want to create it?`,
                default: true
            }
        ]);

        if (createDir.createDir) {
            fs.mkdirSync(fullPath, {recursive: true});
            console.log(chalk.green(`Directory ${fullPath} created successfully.`));
        } else {
            throw new Error(`The directory ${fullPath} does not exist and was not created. Please provide a valid directory.`);
        }
    }
}

const configService = new ConfigService();
export default configService;