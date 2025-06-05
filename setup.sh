#!/bin/bash

# Personal Financial Dashboard Setup Script
# This script helps you set up the application for development or production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Docker installation
check_docker() {
    if command_exists docker; then
        print_success "Docker is installed"
        if docker info >/dev/null 2>&1; then
            print_success "Docker daemon is running"
            return 0
        else
            print_warning "Docker is installed but daemon is not running"
            print_status "Please start Docker Desktop or Docker daemon"
            return 1
        fi
    else
        print_error "Docker is not installed"
        print_status "Please install Docker from https://docs.docker.com/get-docker/"
        return 1
    fi
}

# Function to check Node.js installation
check_node() {
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        return 0
    else
        print_warning "Node.js is not installed"
        print_status "Node.js is required for development mode"
        return 1
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    if command_exists npm; then
        npm install
        print_success "Dependencies installed successfully"
    else
        print_error "npm is not available"
        return 1
    fi
}

# Function to build Docker image
build_docker() {
    print_status "Building Docker image..."
    docker build -t personal-finance-dashboard .
    print_success "Docker image built successfully"
}

# Function to run with Docker Compose
run_docker_compose() {
    print_status "Starting application with Docker Compose..."
    docker-compose up -d
    print_success "Application started successfully"
    print_status "Access the application at: http://localhost:3000"
}

# Function to run development server
run_dev() {
    print_status "Starting development server..."
    npm run dev
}

# Main menu
show_menu() {
    echo ""
    echo "=== Personal Financial Dashboard Setup ==="
    echo "1. Development setup (Node.js + npm)"
    echo "2. Production setup (Docker Compose)"
    echo "3. Build Docker image only"
    echo "4. Check system requirements"
    echo "5. Exit"
    echo ""
    read -p "Please select an option (1-5): " choice
}

# Main script logic
main() {
    echo "Welcome to Personal Financial Dashboard Setup!"
    echo ""

    while true; do
        show_menu
        case $choice in
            1)
                print_status "Setting up development environment..."
                if check_node; then
                    install_dependencies
                    print_success "Development setup complete!"
                    read -p "Do you want to start the development server now? (y/n): " start_dev
                    if [[ $start_dev =~ ^[Yy]$ ]]; then
                        run_dev
                    fi
                else
                    print_error "Please install Node.js first"
                fi
                ;;
            2)
                print_status "Setting up production environment..."
                if check_docker; then
                    run_docker_compose
                else
                    print_error "Please install and start Docker first"
                fi
                ;;
            3)
                print_status "Building Docker image..."
                if check_docker; then
                    build_docker
                else
                    print_error "Please install and start Docker first"
                fi
                ;;
            4)
                print_status "Checking system requirements..."
                echo ""
                print_status "=== System Requirements Check ==="
                check_docker
                check_node
                if command_exists git; then
                    print_success "Git is installed"
                else
                    print_warning "Git is not installed (recommended for updates)"
                fi
                echo ""
                ;;
            5)
                print_status "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please select 1-5."
                ;;
        esac
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main