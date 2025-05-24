export default interface Config {
    os: 'linux/ubuntu';
    environment: 'dev' | 'prod';
    sites_root_dir: string;
    php_versions: number[];
    ressources_preset: RessourcesPreset;
    ports_strategy?: PortMapping | IpamSubnetConfig;
}
export declare enum RessourcesPreset {
    Micro = "Micro (RAM: 1GB, Cores: 1)",
    Small = "Small (RAM: 2GB, Cores: 2)",
    Medium = "Medium (RAM: 4GB, Cores: 4)",
    Large = "Large (RAM: 8GB, Cores: 8)"
}
interface PortStrategy {
    type: 'ipam' | 'port_mapping';
}
/**
 * Undefined ports will not be bind to the host machine.
 */
export declare class PortMapping implements PortStrategy {
    type: 'port_mapping';
    http: number;
    https?: number;
    mysql?: number;
    phpmyadmin?: number;
}
export declare class IpamSubnetConfig implements PortStrategy {
    type: 'ipam';
    subnet: string;
    gateway: string;
    ip_range?: string;
    constructor(subnet: string, gateway: string, ip_range?: string);
    static create(subnet: string): IpamSubnetConfig;
    static validate(subnet: string): boolean;
    private static calculateGateway;
    getAvailableIPs(): string[];
}
export {};
//# sourceMappingURL=Config.d.ts.map