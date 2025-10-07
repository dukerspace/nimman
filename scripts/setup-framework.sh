#!/bin/bash

# CLI tool to select framework and copy appropriate config file
# Author: CLI Generator
# Usage: bash scripts/setup-framework.sh

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to display banner
show_banner() {
    echo ""
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}    Framework Configuration Setup   ${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""
}

# Function to validate user input
validate_choice() {
    local choice=$1
    case $choice in
        1|hono|Hono|HONO)
            return 0
            ;;
        2|nestjs|NestJS|NESTJS)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Function to copy config file
copy_config() {
    local framework=$1
    local source_file=""

    # Get the script directory and derive the project root
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local project_root="$(dirname "$script_dir")"
    local target_file="$project_root/project/ecosystem.config.js"

    print_info "Project root: $project_root"
    print_info "Target file: $target_file"

    case $framework in
        "hono")
            source_file="$project_root/configs/hono-react-router.config.js"
            ;;
        "nestjs")
            source_file="$project_root/configs/nestjs-nextjs.config.js"
            ;;
    esac

    if [ ! -f "$source_file" ]; then
        print_error "Source config file not found: $source_file"
        return 1
    fi

    # Ensure target directory exists
    local target_dir="$(dirname "$target_file")"
    if [ ! -d "$target_dir" ]; then
        print_info "Creating target directory: $target_dir"
        mkdir -p "$target_dir" || {
            print_error "Failed to create target directory"
            return 1
        }
    fi

    # Check if target file already exists
    if [ -f "$target_file" ]; then
        print_warning "Config file already exists at: $target_file"
        echo -n "Do you want to overwrite it? (y/N): "
        read -r overwrite
        case $overwrite in
            [Yy]|[Yy][Ee][Ss])
                print_info "Overwriting existing config file..."
                ;;
            *)
                print_info "Operation cancelled."
                return 1
                ;;
        esac
    fi

    # Copy the file
    if cp "$source_file" "$target_file"; then
        print_success "Successfully copied $framework config to project directory!"
        print_info "Config file location: $target_file"
        return 0
    else
        print_error "Failed to copy config file"
        return 1
    fi
}

# Main function
main() {
    show_banner

    print_info "Please select your framework:"
    echo ""
    echo "  1) Hono + React Router"
    echo "  2) NestJS + Next.js"
    echo ""
    echo -n "Enter your choice (1-2): "

    read -r choice
    echo ""

    if ! validate_choice "$choice"; then
        print_error "Invalid choice. Please enter 1 for Hono or 2 for NestJS."
        exit 1
    fi

    case $choice in
        1|hono|Hono|HONO)
            print_info "You selected: Hono + React Router"
            copy_config "hono"
            ;;
        2|nestjs|NestJS|NESTJS)
            print_info "You selected: NestJS + Next.js"
            copy_config "nestjs"
            ;;
    esac

    if [ $? -eq 0 ]; then
        echo ""
        print_success "Framework setup completed successfully!"
        print_info "You can now use the copied configuration file in your project."
    else
        print_error "Framework setup failed!"
        exit 1
    fi
}

# Run main function
main "$@"
