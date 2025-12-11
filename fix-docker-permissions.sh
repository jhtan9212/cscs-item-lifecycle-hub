#!/bin/bash
# Fix Docker permissions by adding user to docker group

set -e

echo "🔧 Fixing Docker permissions..."
echo ""

# Check if user is already in docker group
if groups | grep -q docker; then
    echo "✅ User is already in docker group"
    echo "   If you still have permission issues, try logging out and back in"
    exit 0
fi

echo "📋 Current user: $(whoami)"
echo "📋 Current groups: $(groups)"
echo ""

# Check if docker group exists
if ! getent group docker > /dev/null 2>&1; then
    echo "❌ Docker group does not exist"
    echo "   This might mean Docker is not properly installed"
    exit 1
fi

echo "⚠️  User needs to be added to the 'docker' group"
echo ""
echo "To fix this, run one of the following:"
echo ""
echo "Option 1: Add user to docker group (requires sudo):"
echo "  sudo usermod -aG docker $USER"
echo "  newgrp docker  # or log out and back in"
echo ""
echo "Option 2: Use sudo for docker commands (not recommended for development):"
echo "  sudo docker-compose up -d"
echo ""
echo "Option 3: Change socket permissions (less secure, not recommended):"
echo "  sudo chmod 666 /var/run/docker.sock"
echo ""
echo "After adding to docker group, verify with:"
echo "  groups"
echo "  docker info"
echo ""

# Check if script is run with sudo
if [ "$EUID" -eq 0 ]; then
    echo "🔐 Running as root - adding user to docker group..."
    USER_TO_ADD=${SUDO_USER:-$USER}
    if [ "$USER_TO_ADD" != "root" ]; then
        usermod -aG docker "$USER_TO_ADD"
        echo "✅ User $USER_TO_ADD added to docker group"
        echo ""
        echo "⚠️  IMPORTANT: You need to log out and back in for changes to take effect"
        echo "   OR run: newgrp docker"
    else
        echo "❌ Cannot determine non-root user"
        echo "   Run: sudo usermod -aG docker $USER"
    fi
else
    echo "💡 To automatically add yourself to docker group, run:"
    echo "   sudo $0"
fi

