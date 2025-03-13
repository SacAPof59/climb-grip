#!/bin/bash
# Prettier Setup Script for Next.js

echo "🎨 Setting up Prettier for your Next.js project..."

# Install dependencies
echo "📦 Installing Prettier and related packages..."
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier

# Create Prettier config
echo "⚙️ Creating Prettier configuration file..."
cat > .prettierrc << 'EOL'
{
  "semi": true,
  "tabWidth": 2,
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "es5",
  "arrowParens": "avoid",
  "jsxSingleQuote": false
}
EOL

# Create Prettier ignore file
echo "🙈 Creating Prettier ignore file..."
cat > .prettierignore << 'EOL'
node_modules
.next
build
public
EOL

# Update ESLint config if it exists
if [ -f .eslintrc.json ]; then
    echo "🔄 Updating ESLint configuration to work with Prettier..."
    tmp=$(mktemp)
    jq '. + {
        "extends": (if .extends then .extends else [] end) + ["prettier"],
        "plugins": (if .plugins then .plugins else [] end) + ["prettier"],
        "rules": (if .rules then .rules else {} end) + {"prettier/prettier": "error", "react/no-unescaped-entities": "off"}
    }' .eslintrc.json > "$tmp" && mv "$tmp" .eslintrc.json
else
    echo "📝 Creating ESLint configuration file..."
    cat > .eslintrc.json << 'EOL'
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error",
    "react/no-unescaped-entities": "off"
  }
}
EOL
fi

# Update package.json
echo "🔄 Adding format script to package.json..."
tmp=$(mktemp)
jq '.scripts += {"format": "prettier --write ."}' package.json > "$tmp" && mv "$tmp" package.json

# Create VS Code settings
echo "💻 Creating VS Code settings for format-on-save..."
mkdir -p .vscode
cat > .vscode/settings.json << 'EOL'
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
EOL

# Ask about setting up Husky
read -p "Do you want to set up Husky for pre-commit formatting? (y/n): " setup_husky
if [ "$setup_husky" = "y" ]; then
    echo "🐶 Setting up Husky and lint-staged..."

    # Install dependencies
    npm install --save-dev husky lint-staged

    # Set up Husky
    npm set-script prepare "husky install"
    npx husky install
    npx husky add .husky/pre-commit "npx lint-staged"

    # Create lint-staged config
    cat > .lintstagedrc.js << 'EOL'
module.exports = {
  "**/*.{js,jsx,ts,tsx}": ["prettier --write", "eslint --fix"],
  "**/*.{json,css,scss,md}": ["prettier --write"]
};
EOL

    echo "✅ Husky and lint-staged set up successfully!"
fi

# Format the project
echo "✨ Formatting your project..."
npx prettier --write .

echo "✅ Prettier setup complete!"
echo "You can now format your code with: npm run format"
echo "If you set up VS Code, your code will format automatically on save."
if [ "$setup_husky" = "y" ]; then
    echo "Your code will also be formatted automatically on commit."
fi