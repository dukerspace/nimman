import { execa } from 'execa'
import { logger } from '../logger'
import { checkCommand, requireCommand, runCommand } from '../shell'

jest.mock('execa', () => ({
  execa: jest.fn(),
}))
jest.mock('../logger', () => ({
  logger: {
    step: jest.fn(),
    error: jest.fn(),
  },
}))

const mockedExeca = execa as jest.MockedFunction<typeof execa>

describe('Shell Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('runCommand', () => {
    it('should execute command successfully', async () => {
      mockedExeca.mockResolvedValueOnce({
        stdout: 'output',
        stderr: '',
        exitCode: 0,
        command: 'test',
        escapedCommand: 'test',
        failed: false,
        killed: false,
        signal: null,
        timedOut: false,
        isCanceled: false,
      } as any)

      const result = await runCommand('echo', ['hello'])

      expect(mockedExeca).toHaveBeenCalledWith('echo', ['hello'], {
        cwd: undefined,
        shell: true,
      })
      expect(result.stdout).toBe('output')
      expect(result.stderr).toBe('')
      expect(logger.step).toHaveBeenCalledWith('Running: echo hello')
    })

    it('should execute command with working directory', async () => {
      mockedExeca.mockResolvedValueOnce({
        stdout: 'output',
        stderr: '',
        exitCode: 0,
        command: 'test',
        escapedCommand: 'test',
        failed: false,
        killed: false,
        signal: null,
        timedOut: false,
        isCanceled: false,
      } as any)

      const result = await runCommand('echo', ['hello'], { cwd: '/tmp' })

      expect(mockedExeca).toHaveBeenCalledWith('echo', ['hello'], {
        cwd: '/tmp',
        shell: true,
      })
      expect(result.stdout).toBe('output')
    })

    it('should not log when silent option is true', async () => {
      mockedExeca.mockResolvedValueOnce({
        stdout: 'output',
        stderr: '',
        exitCode: 0,
        command: 'test',
        escapedCommand: 'test',
        failed: false,
        killed: false,
        signal: null,
        timedOut: false,
        isCanceled: false,
      } as any)

      await runCommand('echo', ['hello'], { silent: true })

      expect(logger.step).not.toHaveBeenCalled()
    })

    it('should throw error when command fails', async () => {
      const error = new Error('Command failed')
      ;(error as any).stdout = 'error output'
      ;(error as any).stderr = 'error details'
      mockedExeca.mockRejectedValueOnce(error)

      await expect(runCommand('invalid', ['command'])).rejects.toThrow('Command failed')
      expect(logger.error).toHaveBeenCalledWith('Command failed: invalid command')
      expect(logger.error).toHaveBeenCalledWith('error output')
      expect(logger.error).toHaveBeenCalledWith('error details')
    })

    it('should not log errors when silent option is true', async () => {
      const error = new Error('Command failed')
      mockedExeca.mockRejectedValueOnce(error)

      await expect(runCommand('invalid', ['command'], { silent: true })).rejects.toThrow()
      expect(logger.error).not.toHaveBeenCalled()
    })
  })

  describe('checkCommand', () => {
    it('should return true when command exists', async () => {
      mockedExeca.mockResolvedValueOnce({
        stdout: '/usr/bin/node',
        stderr: '',
        exitCode: 0,
        command: 'which',
        escapedCommand: 'which',
        failed: false,
        killed: false,
        signal: null,
        timedOut: false,
        isCanceled: false,
      } as any)

      const exists = await checkCommand('node')

      expect(exists).toBe(true)
      expect(mockedExeca).toHaveBeenCalledWith('which', ['node'], { shell: true })
    })

    it('should return false when command does not exist', async () => {
      const error = new Error('Command not found')
      ;(error as any).exitCode = 1
      mockedExeca.mockRejectedValueOnce(error)

      const exists = await checkCommand('nonexistent')

      expect(exists).toBe(false)
    })
  })

  describe('requireCommand', () => {
    it('should not throw when command exists', async () => {
      mockedExeca.mockResolvedValueOnce({
        stdout: '/usr/bin/node',
        stderr: '',
        exitCode: 0,
        command: 'which',
        escapedCommand: 'which',
        failed: false,
        killed: false,
        signal: null,
        timedOut: false,
        isCanceled: false,
      } as any)

      await expect(requireCommand('node')).resolves.not.toThrow()
    })

    it('should throw error when command does not exist', async () => {
      const error = new Error('Command not found')
      ;(error as any).exitCode = 1
      mockedExeca.mockRejectedValueOnce(error)

      await expect(requireCommand('nonexistent')).rejects.toThrow(
        'Required command "nonexistent" not found. Please install it first.'
      )
    })

    it('should include install hint when provided', async () => {
      const error = new Error('Command not found')
      ;(error as any).exitCode = 1
      mockedExeca.mockRejectedValueOnce(error)

      await expect(requireCommand('nonexistent', 'Run: npm install -g tool')).rejects.toThrow(
        'Required command "nonexistent" not found. Run: npm install -g tool'
      )
    })
  })
})
