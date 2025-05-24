declare class ConfigService {
    configFilePath: string;
    constructor();
    createFileIfNotExists(): void;
    runWizard(options: any): void;
}
declare const configService: ConfigService;
export default configService;
//# sourceMappingURL=configService.d.ts.map