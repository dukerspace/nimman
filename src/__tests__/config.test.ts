import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'
import * as path from 'path'
import { loadConfig, saveConfig } from '../config'
import { DeploymentConfig } from '../types'

jest.mock('fs-extra')
jest.mock('js-yaml')

const mockedFs = fs as any
const mockedYaml = yaml as any

describe('Config Utilities', () => {
  const testConfig: DeploymentConfig = {
    project: {
      name: 'test-app',
      domain: 'example.com',
      email: 'admin@example.com',
    },
    services: [
      {
        name: 'backend',
        type: 'backend',
        runtime: 'node',
        port: 3000,
        path: './backend',
        start: {
          command: 'node index.js',
        },
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('loadConfig', () => {
    it('should load and return valid config', async () => {
      const configPath = './nimman.yml'
      const yamlContent =
        'project:\n  name: test-app\n  domain: example.com\n  email: admin@example.com'

      mockedFs.pathExists.mockResolvedValueOnce(true)
      mockedFs.readFile.mockResolvedValueOnce(yamlContent)
      mockedYaml.load.mockReturnValueOnce(testConfig)

      const config = await loadConfig(configPath)

      expect(mockedFs.pathExists).toHaveBeenCalledWith(path.resolve(configPath))
      expect(mockedFs.readFile).toHaveBeenCalledWith(path.resolve(configPath), 'utf-8')
      expect(config).toEqual({
        ...testConfig,
        nginx: { enabled: true },
        ssl: { enabled: true, provider: 'certbot' },
        pm2: { instances: 1 },
      })
    })

    it('should throw error when config file does not exist', async () => {
      const configPath = './nonexistent.yml'
      mockedFs.pathExists.mockResolvedValueOnce(false)

      await expect(loadConfig(configPath)).rejects.toThrow(
        `Config file not found: ${path.resolve(configPath)}`
      )
    })

    it('should throw error when project section is missing', async () => {
      const invalidConfig = { services: testConfig.services }
      mockedFs.pathExists.mockResolvedValueOnce(true)
      mockedFs.readFile.mockResolvedValueOnce('yaml content')
      mockedYaml.load.mockReturnValueOnce(invalidConfig)

      await expect(loadConfig('./nimman.yml')).rejects.toThrow(
        'Config must have a "project" section'
      )
    })

    it('should throw error when project name is missing', async () => {
      const invalidConfig = {
        project: { domain: 'example.com', email: 'admin@example.com' },
        services: testConfig.services,
      }
      mockedFs.pathExists.mockResolvedValueOnce(true)
      mockedFs.readFile.mockResolvedValueOnce('yaml content')
      mockedYaml.load.mockReturnValueOnce(invalidConfig)

      await expect(loadConfig('./nimman.yml')).rejects.toThrow(
        'Project must have "name" and "domain" fields'
      )
    })

    it('should throw error when project domain is missing', async () => {
      const invalidConfig = {
        project: { name: 'test-app', email: 'admin@example.com' },
        services: testConfig.services,
      }
      mockedFs.pathExists.mockResolvedValueOnce(true)
      mockedFs.readFile.mockResolvedValueOnce('yaml content')
      mockedYaml.load.mockReturnValueOnce(invalidConfig)

      await expect(loadConfig('./nimman.yml')).rejects.toThrow(
        'Project must have "name" and "domain" fields'
      )
    })

    it('should throw error when services are missing', async () => {
      const invalidConfig = {
        project: {
          name: 'test-app',
          domain: 'example.com',
          email: 'admin@example.com',
        },
      }
      mockedFs.pathExists.mockResolvedValueOnce(true)
      mockedFs.readFile.mockResolvedValueOnce('yaml content')
      mockedYaml.load.mockReturnValueOnce(invalidConfig)

      await expect(loadConfig('./nimman.yml')).rejects.toThrow(
        'Config must have at least one service'
      )
    })

    it('should throw error when services array is empty', async () => {
      const invalidConfig = {
        project: {
          name: 'test-app',
          domain: 'example.com',
          email: 'admin@example.com',
        },
        services: [],
      }
      mockedFs.pathExists.mockResolvedValueOnce(true)
      mockedFs.readFile.mockResolvedValueOnce('yaml content')
      mockedYaml.load.mockReturnValueOnce(invalidConfig)

      await expect(loadConfig('./nimman.yml')).rejects.toThrow(
        'Config must have at least one service'
      )
    })

    it('should preserve existing nginx, ssl, and pm2 config', async () => {
      const configWithDefaults: DeploymentConfig = {
        ...testConfig,
        nginx: { enabled: false },
        ssl: { enabled: false, provider: 'manual' },
        pm2: { instances: 2, maxMemory: '1G' },
      }

      mockedFs.pathExists.mockResolvedValueOnce(true)
      mockedFs.readFile.mockResolvedValueOnce('yaml content')
      mockedYaml.load.mockReturnValueOnce(configWithDefaults)

      const config = await loadConfig('./nimman.yml')

      expect(config.nginx).toEqual({ enabled: false })
      expect(config.ssl).toEqual({ enabled: false, provider: 'manual' })
      expect(config.pm2).toEqual({ instances: 2, maxMemory: '1G' })
    })
  })

  describe('saveConfig', () => {
    it('should save config to file', async () => {
      const configPath = './nimman.yml'
      const yamlContent = 'project:\n  name: test-app'

      mockedYaml.dump.mockReturnValueOnce(yamlContent)

      await saveConfig(testConfig, configPath)

      expect(mockedYaml.dump).toHaveBeenCalledWith(testConfig, { indent: 2 })
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.resolve(configPath),
        yamlContent,
        'utf-8'
      )
    })
  })
})
