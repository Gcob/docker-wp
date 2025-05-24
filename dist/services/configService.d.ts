import Config, { IpamSubnetConfig, PortMapping } from "../models/Config.js";
declare class ConfigService {
    configFilePath: string;
    constructor();
    createConfigFileIfNotExists(): void;
    saveConfig(config: Config): void;
    getConfig(): Config;
    runWizard(options: any): Promise<Config>;
    runWizard__createPortMapping(oldPortMapping?: PortMapping): Promise<PortMapping>;
    runWizard__createIpamSubnetConfig(oldIpamSubnetConfig?: IpamSubnetConfig): Promise<IpamSubnetConfig>;
    private runWizard__checkAndCreateRootDir;
}
declare const configService: ConfigService;
export default configService;
//# sourceMappingURL=configService.d.ts.map