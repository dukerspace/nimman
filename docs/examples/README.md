# Configuration Examples

This directory contains example `nimman.yml` configuration files for different use cases.

## Examples

### [simple-fullstack.yml](./simple-fullstack.yml)
Basic full-stack application with React/Vue frontend and Express.js backend.

**Use case:** Standard web application with frontend and API.

### [bun-backend.yml](./bun-backend.yml)
Bun runtime backend with TypeScript.

**Use case:** Modern backend using Bun runtime for better performance.

### [multi-service.yml](./multi-service.yml)
Complex application with frontend, API, and background worker.

**Use case:** Applications requiring multiple services including background job processing.

### [staging-environment.yml](./staging-environment.yml)
Staging environment configuration.

**Use case:** Separate staging deployment with different settings.

## How to Use

1. Copy an example file to your project root:
   ```bash
   cp docs/examples/simple-fullstack.yml nimman.yml
   ```

2. Edit the configuration to match your project:
   - Update `project.name`, `project.domain`, `project.email`
   - Adjust service paths and commands
   - Configure environment variables

3. Deploy:
   ```bash
   sudo nimman setup
   nimman deploy
   ```

## Customization Tips

- **Service paths**: Update `path` to match your project structure
- **Build commands**: Adjust `build.command` to match your build scripts
- **Ports**: Ensure ports don't conflict with other services
- **Instances**: Increase `instances` for better performance (use CPU count as guide)
- **Environment variables**: Add all required environment variables in `env` section

## Need Help?

See the [Full Documentation](../document.md) for detailed configuration options.

