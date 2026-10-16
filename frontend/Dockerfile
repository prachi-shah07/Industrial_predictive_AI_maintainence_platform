FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose Vite default port
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
