import Config from "../models/Config";
declare class ConfigService {
    configFilePath: string;
    constructor();
    createConfigFileIfNotExists(): void;
    saveConfig(config: Config): void;
    runWizard(options: any): Promise<void>;
}
declare const configService: ConfigService;
export default configService;
//# sourceMappingURL=configService.d.ts.map