#!/bin/bash
set -e

# ══════════════════════════════════════════════════════════════
# KaffaApp - Environment Setup Script
# ══════════════════════════════════════════════════════════════

echo "🔧 Preparando entorno para KaffaApp en $(hostname)..."

# ─── Install OpenJDK 17 ──────────────────────────────────────
echo "☕ Instalando OpenJDK 17..."
sudo apt update
sudo apt install -y openjdk-17-jdk

# ─── Install Node.js 20.x ────────────────────────────────────
echo "📦 Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# ─── Configure JAVA_HOME ─────────────────────────────────────
JDK_PATH=$(readlink -f /usr/bin/javac | sed "s:/bin/javac::")

if ! grep -q "JAVA_HOME" ~/.bashrc; then
  echo "" >> ~/.bashrc
  echo "# Configuration for KaffaApp" >> ~/.bashrc
  echo "export JAVA_HOME=$JDK_PATH" >> ~/.bashrc
  echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> ~/.bashrc
  echo "✅ JAVA_HOME configurado en ~/.bashrc"
else
  # Update existing JAVA_HOME if needed
  sed -i "s|export JAVA_HOME=.*|export JAVA_HOME=$JDK_PATH|" ~/.bashrc
  echo "✅ JAVA_HOME actualizado en ~/.bashrc"
fi

# ─── Final check ─────────────────────────────────────────────
echo ""
echo "✨ ¡Entorno listo para verificar la modernización!"
echo "--------------------------------------------------------"
echo "  Java version: $(java -version 2>&1 | head -n 1)"
echo "  Node version: $(node -v)"
echo "  NPM version:  $(npm -v)"
echo "--------------------------------------------------------"
echo "👉 IMPORTANTE: Ejecuta 'source ~/.bashrc' para aplicar los cambios."
echo "👉 Luego, corre './start_app.sh' para lanzar KaffaApp."
echo ""
