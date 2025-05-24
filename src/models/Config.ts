export default interface Config {
    environment: 'dev' | 'prod';
    sites_root_dir: string;
    php_versions: number[];
    ressources_preset: RessourcesPreset;
}

export enum RessourcesPreset {
    Micro = 'Micro (RAM: 1GB, Cores: 1)',
    Small = 'Small (RAM: 2GB, Cores: 2)',
    Medium = 'Medium (RAM: 4GB, Cores: 4)',
    Large = 'Large (RAM: 8GB, Cores: 8)',
}