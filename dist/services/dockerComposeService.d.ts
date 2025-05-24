import Config from "../models/Config.js";
declare class DockerComposeService {
    applyConfig(configEdited: Config): void;
    generateDockerComposeFile(config: Config): void;
    getWPSitesConfig(config: Config): any[];
    applyWPSiteConfig(siteConfig: any): void;
}
declare const dockerComposeService: DockerComposeService;
export default dockerComposeService;
//# sourceMappingURL=dockerComposeService.d.ts.map