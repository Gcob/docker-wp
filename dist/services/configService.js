import fs from 'fs';
class ConfigService {
    constructor() {
        this.configFilePath = '~/.docker-wp-cli/config.json';
        this.configFilePath = this.configFilePath.replace('~', process.env.HOME || process.env.USERPROFILE);
        this.createFileIfNotExists();
    }
    createFileIfNotExists() {
        const directory = this.configFilePath.substring(0, this.configFilePath.lastIndexOf('/'));
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
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
        console.log('Starting configuration wizard...');
    }
}
const configService = new ConfigService();
export default configService;
//# sourceMappingURL=configService.js.map