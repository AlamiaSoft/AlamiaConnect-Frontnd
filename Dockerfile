FROM node:20-alpine

WORKDIR /app

# Install compatibility libraries for Alpine
RUN apk add --no-cache libc6-compat

# Install pnpm via corepack (included in Node 20)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifest files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (allow lockfile update for now to unblock build)
RUN pnpm install

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 3000

# Start in development mode
CMD ["pnpm", "dev"]
