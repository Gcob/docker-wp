export var RessourcesPreset;
(function (RessourcesPreset) {
    RessourcesPreset["Micro"] = "Micro (RAM: 1GB, Cores: 1)";
    RessourcesPreset["Small"] = "Small (RAM: 2GB, Cores: 2)";
    RessourcesPreset["Medium"] = "Medium (RAM: 4GB, Cores: 4)";
    RessourcesPreset["Large"] = "Large (RAM: 8GB, Cores: 8)";
})(RessourcesPreset || (RessourcesPreset = {}));
/**
 * Undefined ports will not be bind to the host machine.
 */
export class PortMapping {
    constructor() {
        this.type = 'port_mapping';
        this.http = 80;
        this.https = 443;
        this.mysql = 3306;
        this.phpmyadmin = 3307;
    }
}
export class IpamSubnetConfig {
    constructor(subnet, gateway, ip_range) {
        this.type = 'ipam';
        this.subnet = subnet;
        this.gateway = gateway;
        this.ip_range = ip_range;
    }
    static create(subnet) {
        if (!this.validate(subnet)) {
            throw new Error(`Invalid subnet format: ${subnet}`);
        }
        const gateway = this.calculateGateway(subnet);
        return new IpamSubnetConfig(subnet, gateway);
    }
    static validate(subnet) {
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
    static calculateGateway(subnet) {
        const [ip, prefixLength] = subnet.split('/');
        const octets = ip.split('.').map(Number);
        // Par convention, on utilise généralement la première adresse disponible comme gateway
        // Pour un réseau comme 192.168.100.0/30, la gateway sera 192.168.100.1
        const lastOctet = octets[3];
        if (lastOctet === 0) {
            octets[3] = 1;
        }
        else {
            octets[3] = lastOctet + 1;
        }
        return octets.join('.');
    }
    getAvailableIPs() {
        const [ip, prefixLength] = this.subnet.split('/');
        const prefix = parseInt(prefixLength);
        const octets = ip.split('.').map(Number);
        const hostBits = 32 - prefix;
        const numHosts = Math.pow(2, hostBits) - 2; // -2 for network and broadcast addresses
        const availableIPs = [];
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
//# sourceMappingURL=Config.js.map