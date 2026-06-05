FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy the entire project
# (We use a .dockerignore to skip node_modules and build artifacts)
COPY . .

# Install dependencies for all workspaces
RUN npm install

# Build the server workspace
RUN npm run build -w server

# Expose the default port (Render will also provide the PORT environment variable)
EXPOSE 4000

# Start the server using the workspace command
CMD ["npm", "start", "-w", "server"]
