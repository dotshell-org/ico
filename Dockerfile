# Use an official Node.js image as a base
FROM node:22

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies including X11 virtual framebuffer
RUN apt update && apt install -y \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libgtk-3-0 \
    libgbm-dev \
    libasound2 \
    xvfb

# Install npm dependencies
RUN npm install -g npm@11.2.0
RUN npm run rebuild

# Copy the rest of the project files
COPY . .

# Expose the port
EXPOSE 3000

# Wrap the start command with xvfb-run
CMD ["xvfb-run", "--auto-servernum", "npm", "run", "dev"]