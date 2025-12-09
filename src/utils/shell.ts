import { execa } from 'execa'
import { logger } from './logger'

export async function runCommand(
  command: string,
  args: string[] = [],
  options: { cwd?: string; silent?: boolean } = {}
): Promise<{ stdout: string; stderr: string }> {
  if (!options.silent) {
    logger.step(`Running: ${command} ${args.join(' ')}`)
  }

  try {
    const result = await execa(command, args, {
      cwd: options.cwd,
      shell: true,
    })
    return { stdout: result.stdout, stderr: result.stderr }
  } catch (error: any) {
    if (!options.silent) {
      logger.error(`Command failed: ${command} ${args.join(' ')}`)
      if (error.stdout) logger.error(error.stdout)
      if (error.stderr) logger.error(error.stderr)
    }
    throw error
  }
}

export async function checkCommand(command: string): Promise<boolean> {
  try {
    await execa('which', [command], { shell: true })
    return true
  } catch {
    return false
  }
}

export async function requireCommand(command: string, installHint?: string): Promise<void> {
  const exists = await checkCommand(command)
  if (!exists) {
    throw new Error(
      `Required command "${command}" not found. ${installHint || 'Please install it first.'}`
    )
  }
}
