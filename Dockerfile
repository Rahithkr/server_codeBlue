FROM node:alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Install additional packages, for example, mongoose
RUN npm install mongoose --save

# Copy the rest of the application code
COPY . .

EXPOSE 5000

# Start the application
CMD ["node", "src/app.js"]
