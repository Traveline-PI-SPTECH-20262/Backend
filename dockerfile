FROM node
WORKDIR /app
COPY packege.json /app
RUN npm install
COPY . /app
EXPOSE 8080
CMD ["npm", "start"]
