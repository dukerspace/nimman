#############################
# Makefile for common scripts
# Usage: make <target>
#############################

SHELL := /bin/bash
SCRIPTS_DIR := ./scripts

# Generic runner (internal)
run-script = bash $(SCRIPTS_DIR)/$1.sh

.PHONY: help db-up install-base install-docker install-nginx setup-framework install-%

help:
	@echo "Available targets:";
	@echo "  db-up            - Start / init database (runs db.sh)";
	@echo "  install-base     - Base install (install.sh)";
	@echo "  install-docker   - Docker related install (docker.sh)";
	@echo "  install-nginx    - Nginx install/config (nginx.sh)";
	@echo "  setup-framework  - Framework setup (setup-framework.sh)";
	@echo "  install-<name>   - Run scripts/<name>.sh (pattern rule)";
	@echo "";
	@echo "Examples:";
	@echo "  make install-base";
	@echo "  make install-docker";
	@echo "  make install-nginx";
	@echo "  make install-custom (if scripts/custom.sh exists)";

# Explicit targets using dedicated scripts
db-up:
	$(call run-script,db)

install-base:
	$(call run-script,install)

install-docker:
	$(call run-script,docker)

install-nginx:
	$(call run-script,nginx)

setup-framework:
	$(call run-script,setup-framework)

# Pattern rule for any install-<name> script to reduce boilerplate
install-%:
	@if [ -f "$(SCRIPTS_DIR)/$*.sh" ]; then \
		$(call run-script,$*); \
	else \
		echo "Script $(SCRIPTS_DIR)/$*.sh not found"; exit 1; \
	fi

