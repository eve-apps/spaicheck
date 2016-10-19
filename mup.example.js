const mailUser = 'postmaster@blah.mailgun.org';
const mailPass = 'b4da55';
const mailServer = 'smtp.mailgun.org';
const mailPort = '587';


module.exports = {
  servers: {
    one: {
      host: '1.2.3.4',
      username: 'root',
      // pem: '/home/user/.ssh/id_rsa', // mup doesn't support '~' alias for home directory
      // password: 'password',
      // or leave blank for authenticate from ssh-agent
    },
  },

  meteor: {
    name: 'spaicheck',
    // You should set path to the root path of the spaicheck app
    path: '../',
    servers: {
      one: {},
    },
    buildOptions: {
      serverOnly: true,
    },
    env: {
      ROOT_URL: 'http://1.2.3.4/',
      MONGO_URL: 'mongodb://localhost/meteor',
      METEOR_ENV: 'production',
      MAIL_URL: `smtp://${mailUser}:${mailPass}@${mailServer}:${mailPort}`,
    },

    // Use abernix's docker image for Meteor 1.4 compatiblity
    dockerImage: 'abernix/meteord:base',
    deployCheckWaitTime: 60,
  },

  mongo: {
    oplog: true,
    port: 27017,
    servers: {
      one: {},
    },
  },
};
