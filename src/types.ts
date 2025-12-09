export interface ServiceConfig {
  name: string;
  type: 'frontend' | 'backend' | 'service';
  runtime: 'node' | 'bun';
  port: number;
  path: string;
  build?: {
    command?: string;
    output?: string;
  };
  start: {
    command?: string;
    script?: string;
    args?: string[];
    cwd?: string;
  };
  instances?: number;
  env?: Record<string, string>;
  healthCheck?: {
    path: string;
    port?: number;
  };
}

export interface DeploymentConfig {
  project: {
    name: string;
    domain: string;
    email: string; // For Let's Encrypt
  };
  services: ServiceConfig[];
  nginx?: {
    enabled: boolean;
    configPath?: string;
  };
  ssl?: {
    enabled: boolean;
    provider?: 'certbot' | 'manual';
  };
  pm2?: {
    instances?: number;
    maxMemory?: string;
  };
}

