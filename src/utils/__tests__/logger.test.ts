// Mock chalk before importing logger to avoid ESM issues
jest.mock('chalk', () => {
  const mockChalk: any = jest.fn((str: string) => str)
  mockChalk.blue = jest.fn((str: string) => `blue:${str}`)
  mockChalk.green = jest.fn((str: string) => `green:${str}`)
  mockChalk.red = jest.fn((str: string) => `red:${str}`)
  mockChalk.yellow = jest.fn((str: string) => `yellow:${str}`)
  mockChalk.cyan = jest.fn((str: string) => `cyan:${str}`)
  return mockChalk
})

import { logger } from '../logger'

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  describe('info', () => {
    it('should log info message', () => {
      logger.info('Test info message')
      expect(consoleLogSpy).toHaveBeenCalledTimes(1)
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ℹ'), 'Test info message')
    })
  })

  describe('success', () => {
    it('should log success message', () => {
      logger.success('Test success message')
      expect(consoleLogSpy).toHaveBeenCalledTimes(1)
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('✓'),
        'Test success message'
      )
    })
  })

  describe('error', () => {
    it('should log error message', () => {
      logger.error('Test error message')
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('✗'),
        'Test error message'
      )
    })
  })

  describe('warn', () => {
    it('should log warning message', () => {
      logger.warn('Test warning message')
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('⚠'),
        'Test warning message'
      )
    })
  })

  describe('step', () => {
    it('should log step message', () => {
      logger.step('Test step message')
      expect(consoleLogSpy).toHaveBeenCalledTimes(1)
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('→'), 'Test step message')
    })
  })
})
