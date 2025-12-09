# Nimman Documentation

Complete documentation for the Nimman CLI deployment tool.

## Documentation Structure

### 📖 [Full Documentation](./document.md)
Complete guide covering all features, commands, configuration options, examples, and troubleshooting.

**Start here for:** Comprehensive understanding of all features and advanced usage.

### 🚀 [Getting Started](./getting-started.md)
Quick start guide to get your application deployed in minutes.

**Start here if:** You want to deploy quickly and learn as you go.

### ⚡ [Quick Reference](./quick-reference.md)
Quick reference card with common commands and configuration snippets.

**Start here if:** You're already familiar with Nimman and need a cheat sheet.

### 📝 [Examples](./examples/)
Example configuration files for different use cases.

**Start here if:** You want to see real-world configuration examples.

## Quick Navigation

### For New Users
1. Read [Getting Started](./getting-started.md)
2. Check [Examples](./examples/) for your use case
3. Refer to [Full Documentation](./document.md) as needed

### For Experienced Users
1. Use [Quick Reference](./quick-reference.md) for commands
2. Check [Examples](./examples/) for configuration patterns
3. See [Full Documentation](./document.md) for advanced topics

## Common Tasks

### First Time Setup
```bash
nimman init
sudo nimman setup
nimman deploy
```

### Update Deployment
```bash
git pull
nimman deploy
```

### Deploy to Staging
```bash
nimman deploy --config nimman.staging.yml --env staging
```

### Check Status
```bash
pm2 status
pm2 logs
```

## Documentation Files

- **[document.md](./document.md)** - Complete CLI documentation with detailed examples
- **[getting-started.md](./getting-started.md)** - Quick start guide
- **[quick-reference.md](./quick-reference.md)** - Command and configuration reference
- **[examples/](./examples/)** - Example configuration files

## Need Help?

- Check the [Troubleshooting section](./document.md#troubleshooting) in the full documentation
- Review [Examples](./examples/) for configuration patterns
- Verify your setup matches the [Getting Started guide](./getting-started.md)

## Contributing

Found an issue or have a suggestion? Please open an issue or pull request on the project repository.

