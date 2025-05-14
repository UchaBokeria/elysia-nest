#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo -e "${RED}Error: npm is not installed. Please install npm first.${NC}"
  exit 1
fi

# Check if the user is logged in to npm
echo -e "${YELLOW}Checking npm login status...${NC}"
npm whoami &> /dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}Error: You are not logged in to npm. Please run 'npm login' first.${NC}"
  exit 1
fi

# Verify package.json information
echo -e "${YELLOW}Verifying package.json...${NC}"
AUTHOR=$(grep -o '"author": ".*",' package.json | cut -d '"' -f 4)
if [[ $AUTHOR == "Your Name <your.email@example.com>" ]]; then
  echo -e "${RED}Error: Please update the author field in package.json with your information.${NC}"
  exit 1
fi

# Build the package
echo -e "${YELLOW}Building the package...${NC}"
bun run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed. Aborting publish.${NC}"
  exit 1
fi

# Display package information
NAME=$(grep -o '"name": ".*",' package.json | cut -d '"' -f 4)
VERSION=$(grep -o '"version": ".*",' package.json | cut -d '"' -f 4)

echo -e "${GREEN}Package details:${NC}"
echo -e "Name: ${GREEN}$NAME${NC}"
echo -e "Version: ${GREEN}$VERSION${NC}"
echo -e "Author: ${GREEN}$AUTHOR${NC}"

# Prompt for confirmation
echo -e "${YELLOW}Are you sure you want to publish this package to npm? (y/N)${NC}"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Publication aborted.${NC}"
  exit 0
fi

# Ask if this is the first publish
echo -e "${YELLOW}Is this the first time publishing this package? (y/N)${NC}"
read -r first_time
if [[ "$first_time" =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Publishing with public access...${NC}"
  npm publish --access public
else
  echo -e "${YELLOW}Publishing...${NC}"
  npm publish
fi

# Check if publish was successful
if [ $? -ne 0 ]; then
  echo -e "${RED}Publish failed.${NC}"
  exit 1
fi

echo -e "${GREEN}Package published successfully!${NC}"

# Ask if the user wants to create a git tag
echo -e "${YELLOW}Do you want to create a git tag for version v$VERSION? (y/N)${NC}"
read -r create_tag
if [[ "$create_tag" =~ ^[Yy]$ ]]; then
  git tag -a "v$VERSION" -m "Release version $VERSION"
  git push origin "v$VERSION"
  echo -e "${GREEN}Git tag v$VERSION created and pushed.${NC}"
fi 