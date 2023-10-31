#!/usr/bin/env node

// https://github.com/flatiron/prompt

const fs = require('fs');
const {
  join,
  relative,
  dirname } = require('path');
const util = require('util');
const crypto = require('crypto');

const mkdirp = require('mkdirp').sync;
const slug = require('slug');
const omit = require('omit');

const { prompt } = require('inquirer');
const shell = require('shelljs');
const colors = require("colors/safe");

// Set source and destination dirs
const templatePath = `${__dirname}/templates/`;
const localPath = process.cwd();

// Extract keys to prompt for
const package_json = require(`${templatePath}/package.json`);
const sensitive_json = require(`${templatePath}/sensitive.json`);

const yes_no_pattern = /y[es]*|n[o]?/;
const yes_pattern = /y[es]/;

// Intermediary storage
const store = {};

// Set prompt as green and use the "Replace" text
prompt.message = colors.green("Package");
prompt.delimiter = ': ';
prompt.colors = false;

const checkErrorVar = function (err, message) {
  if (err) {
    console.error(err);
    if (message) console.info(message);
    process.exit(0);
  }
}

const nextStep = (function () {
  steps = [
    'parseSuperuser',
    'parsePackageJson',
    'parsemailConfig',
    'parseHashSecret',
    'maybeMkProjectdir',
    'verifySettings',
    'createFileStructure',
    'installPackages',
    'createAdminUser',
    'showFeedback',
  ];
  return function () {
    const fn_name = steps.shift();
    eval(`${fn_name}()`);
  }
})();



/**
 * Steps
 */

const parseSuperuser = function () {
  const su = sensitive_json.superuser;

  prompt([
    {
      type: 'input',
      name: 'firstName',
      message: "Your first name",
      default: (res) => su.firstName,
      validate: ((val, res) => !!val)
    },
    {
      type: 'input',
      name: 'lastName',
      message: "Your last name",
      default: (res) => su.lastName,
      validate: ((val, res) => !!val)
    },
    {
      type: 'input',
      name: 'email',
      message: "Your email-address",
      default: (res) => su.email,
      validate: ((val, res) => !!val)
    },
    {
      type: 'input',
      name: 'handle',
      message: "Your username/handle",
      default: (res) => slug(res.email.split('@').shift()),
      validate: ((val, res) => !!val)
    },
  ])
    .then(res => {
      Object.assign(su, res)
      nextStep();
    });

}


const parsemailConfig = function () {
  const mailConfig = sensitive_json.mailConfig;

  prompt([
    {
      type: 'input',
      name: 'senderEmail',
      message: "Server sender email-address",
      default: (res) => mailConfig.senderEmail,
      validate: ((val, res) => !!val)
    },
    {
      type: 'confirm',
      name: 'useMailgun',
      message: "Set up mailgun as nodemailer transport?",
      default: (res) => true,
    }
  ])
    .then(res => {
      mailConfig.senderEmail = res.senderEmail;

      if (res.useMailgun) {

        const mailgunAuth = mailConfig.mailgunAuth

        prompt([
          {
            type: 'input',
            name: 'apiKey',
            message: "Mailgun api key",
            default: (res) => mailgunAuth.api_key,
            validate: ((val, res) => !!val)
          },
          {
            type: 'input',
            name: 'domain',
            message: "Mailgun domain",
            default: (res) => mailgunAuth.domain,
            validate: ((val, res) => !!val)
          },
        ])
          .then(res => {
            Object.assign(mailgunAuth, {
              api_key: res.apiKey,
              domain: res.domain
            })
            nextStep();
          });

      }
      else {
        nextStep();
      }
    })
}


const parseHashSecret = function () {
  sensitive_json.hashSecret = crypto.randomBytes(20).toString('hex');
  nextStep();
}


const parsePackageJson = function () {
  let question;
  const defaults = {};

  // Set `author.default` to `superUser` identity
  const su = sensitive_json.superuser;
  defaults.author = `${su.firstName} ${su.lastName} <${su.email}>`

  const questions = Object.keys(package_json)
    .filter(key => (typeof package_json[key] == 'string' ? package_json[key].match(/\[(.*?)\]/) : false))
    .map(key => [key, package_json[key].match(/\[(.*?)\]/)[1]])
    .map(([key, pkgDefault]) => ({
      type: 'input',
      name: key,
      message: `Package.json ${key}`,
      default: (res) => defaults[key] || pkgDefault,
      validate: ((val, res) => !!val)
    }));

  prompt(questions).then(res => {
    Object.assign(package_json, res);
    nextStep();
  });
}


const maybeMkProjectdir = function () {

  store.project_path = '';

  prompt([
    {
      type: 'confirm',
      name: 'mkdir',
      message: "Create project folder here?",
      default: (res) => true,
    },
  ])
    .then(res => {

      if (res.mkdir) {

        prompt([
          {
            type: 'input',
            name: 'projectDir',
            message: "Project folder name",
            default: (res) => slug(package_json.name).toLowerCase(),
            validate: ((val, res) => !!val)
          },
        ])
          .then(res => {
            store.project_path = join(localPath, res.projectDir);
            nextStep();
          })
      }
      else {
        nextStep();
      }

    })

};


const verifySettings = function () {
  console.info(`Verify: creating at path "${store.project_path}"`)
  prompt([
    {
      type: 'confirm',
      name: 'mkdir',
      message: "Proceed with project creation?",
      default: (res) => true,
    },
  ])
    .then(res => {
      if (res.mkdir) {
        nextStep();
      }
    });
}


const createFileStructure = function () {
  const project_path = store.project_path;

  mkdirp(project_path);

  console.info('Copying files...');
  shell.cp('-R', `${templatePath}/*`, project_path);

  // After recursive copy, (over)write the json settings files
  fs.writeFileSync(join(project_path, 'package.json'), JSON.stringify(package_json, null, 2));
  fs.writeFileSync(join(project_path, 'sensitive.json'), JSON.stringify(sensitive_json, null, 2));

  nextStep();
}


const installPackages = function () {
  // Npm Linking
  console.info('Linking to cmx...');
  shell.exec(`npm link cmx -S`, { silent: false, cwd: store.project_path }, function (err, stdout, stderr) {
    checkErrorVar(err, 'Could not link to cmx. Make sure you have npm-linked it allready!');
    nextStep();
  })
}


const createAdminUser = function () {

  const users_dir = join(store.project_path, 'db/users');

  const superuser_path = join(store.project_path, 'db/users', sensitive_json.superuser.handle);

  // Mkdirp the deepest dir
  mkdirp(dirname(superuser_path));

  // Add superuser `user.json`
  fs.writeFileSync(join(superuser_path, 'user.json'), JSON.stringify(sensitive_json.superuser, null, 2));

  // Add superuser `auth.json`
  fs.writeFileSync(join(superuser_path, 'auth.json'), JSON.stringify({ "groups": ["admin"] }, null, 2));

  nextStep();
}

const showFeedback = function () {
  let path_diff_str = relative(localPath, store.project_path);
  if (path_diff_str) {
    path_diff_str = `cd ${path_diff_str} && `
  }

  console.info('done');

  console.info(`run '${path_diff_str} npm install'`);
  console.info(`(Also run 'npm link cmx' if you have git cloned that repo...)`)
}

/**
 * Run first step
 */
nextStep();