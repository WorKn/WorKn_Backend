module.exports = {
  apps: [
    {
      name: "WorKn_Backend",
      script: "./index.js",
    },
  ],
  deploy: {
    production: {
      user: "ubuntu",
      host: "ec2-3-133-94-54.us-east-2.compute.amazonaws.com/",
      port: "443",
      key: "~/.ssh/id_rsa",
      ref: "origin/master",
      repo: "git@github.com:WorKn/WorKn_Backend.git",
      path: "/home/ubuntu/WorKn_Backend",
      "post-deploy": "npm install && pm2 startOrRestart ecosystem.config.js",
    },
  },
};
