export default interface Config {
    os: 'linux/ubuntu';
    environment: 'dev' | 'prod';
    sites_root_dir: string;
    ressources_preset: RessourcesPreset;
    php_versions: number[];
    mariadb_root_password?: string;
    ports_strategy?: PortMapping | IpamSubnetConfig;
}

export enum RessourcesPreset {
    Micro = 'Micro (RAM: 1GB, Cores: 1)',
    Small = 'Small (RAM: 2GB, Cores: 2)',
    Medium = 'Medium (RAM: 4GB, Cores: 4)',
    Large = 'Large (RAM: 8GB, Cores: 8)',
}

interface PortStrategy {
    type: 'ipam' | 'port_mapping';
}

/**
 * Undefined ports will not be bind to the host machine.
 */
export class PortMapping implements PortStrategy {
    type: 'port_mapping' = 'port_mapping';
    http: number = 80;
    https?: number = 443;
    mysql?: number = 3306;
    phpmyadmin?: number = 3307;
}

export class IpamSubnetConfig implements PortStrategy {
    type: 'ipam' = 'ipam';
    subnet: string;
    gateway: string;
    nginxIp: string;

    constructor(subnet: string) {
        this.subnet = subnet;

        const ips = this.getAvailableIPs();

        if (ips.length < 2) {
            throw new Error(`Not enough available IPs in the subnet ${subnet}. At least 2 IPs are required.`);
        }

        this.gateway = ips[0];
        this.nginxIp = ips[1];
    }

    static create(subnet: string): IpamSubnetConfig {
        if (!this.validate(subnet)) {
            throw new Error(`Invalid subnet format: ${subnet}`);
        }

        return new IpamSubnetConfig(subnet);
    }

    static validate(subnet: string): boolean {
        // Regex for CIDR (ex: 192.168.100.0/30)
        const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;

        if (!cidrRegex.test(subnet)) {
            return false;
        }

        const [ip, prefixLength] = subnet.split('/');
        const prefix = parseInt(prefixLength);

        // Make sure the prefix length is between 0 and 32
        if (prefix < 0 || prefix > 32) {
            return false;
        }

        // Check if the IP address is valid
        const octets = ip.split('.').map(Number);
        return octets.every(octet => octet >= 0 && octet <= 255);
    }

    getAvailableIPs(): string[] {
        const [ip, prefixLength] = this.subnet.split('/');
        const prefix = parseInt(prefixLength);
        const octets = ip.split('.').map(Number);

        const hostBits = 32 - prefix;
        const numHosts = Math.pow(2, hostBits) - 2; // -2 for network and broadcast addresses

        const availableIPs: string[] = [];
        const baseIP = octets[0] * 16777216 + octets[1] * 65536 + octets[2] * 256 + octets[3];

        for (let i = 1; i <= numHosts && i < 100; i++) { //  limit to 100 IPs for practical reasons
            const currentIP = baseIP + i;
            const newOctets = [
                Math.floor(currentIP / 16777216) % 256,
                Math.floor(currentIP / 65536) % 256,
                Math.floor(currentIP / 256) % 256,
                currentIP % 256
            ];
            availableIPs.push(newOctets.join('.'));
        }

        return availableIPs;
    }
}

