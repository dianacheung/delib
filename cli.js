'use strict';
const program = require('commander');
const childProcess = require('child_process');
const path = require('path');
const stringArgv = require('string-argv');
const fs = require('fs');

const Ethereum = require('./src/ethereum/ethereum.js');
const IPFS = require('./src/ipfs/ipfs.js');
const Contracts = require('./src/models/Contracts.js');

const config = require('./src/config/config.js');


program
  .version('1.0.0');

program
  .command('init')
  .action(() => {
    // create the file structure for this cli tool to run
    /*
    root
      contracts
        solidity
        built

    */
  });

/**
  * Build a Solidity contract from contract directory specificied in Ethereum.config.contracts
  */
program
  .command('build <file>')
  .action((file) => {
    Ethereum.buildContracts(file);
  });

/**
 * Set options for transactions called with CLI.
 */
// program
//   .command('options <fromIndex> <value> <gas> [extra...]')
//   .action((fromIndex, value, gas, extra) => {
//     Ethereum.init();
//     const fromAccount = Ethereum.accounts[fromIndex];
//     let gasValue = null;
//     if (extra[0]) gasValue = extra[0];
//
//     Cli.setOptions(fromAccount, value, gas, gasValue)
//       .then(status => {
//         console.log(status);
//         return Cli.getOptions();
//       })
//       .then(options => {
//         console.log(options);
//       })
//       .catch(err => {
//         console.error(err);
//       });
//   });

/**
 * Deploy a built contract located in path provided by Ethereum.config.built.
 */
program
  .command('deploy <contractName> [args...]')
  .action((contractName, args) => {
    Ethereum.init();
    Ethereum.options = config.cli.options;
    Ethereum.deploy(contractName, args)
      .then(instance => {
        console.log(instance.address);
        Contracts.set(contractName, instance.address);
      })
      .catch(err => {
        console.error(err);
      });
  });

/**
 * Set the address of a particular contract when called with exec
 */
program
  .command('set <contractName> <contractAddress>')
  .action((contractName, contractAddress) => {
    Contracts.set(contractName, contractAddress);
  });

/**
 * Executes a deployed contract with specified method and provided arguments
 */
program
  .command('exec <contractName> <method> [args...]')
  .action((contractName, method, args) => {
    Ethereum.init();
    Ethereum.options = config.cli.options;
    const contractAddress = Contracts.get(contractName);
    const contract = Ethereum.execAt(contractName, contractAddress);
    // args.push(Ethereum.options);

    contract[method].apply(this, args)
      .then(txRes => {
        console.log(txRes);
      })
      .catch(err => {
        console.error(err);
      });
  });

program
  .command('logs <contractName> <event>')
  .action((contractName, event) => {
    Ethereum.init();
    const contractAddress = Contracts.get(contractName);
    Ethereum.getEventLogs(contractName, contractAddress, event)
      .then(logs => {
        console.log(logs);
      })
      .catch(err => {
        console.error(err);
      });
  });

/**
 * Get the balance of a particular Ethereum account based on account index.
 */
program
  .command('balance <index>')
  .action((index) => {
    Ethereum.init();
    const balance = Ethereum.getBalanceEther(index);
    console.log(balance);
  });

/**
 * Create a new Ethereum account
 */
program
  .command('create <password>')
  .action(password => {
    Ethereum.init();
    Ethereum.createAccount(password)
      .then(res => {
        console.log(res);
        process.exit();
      })
      .catch(err => {
        console.error(err);
        process.exit();
      });
  });

/**
  * Unlocks an Ethereum account.
  */
program
  .command('unlock <index> <password> <time>')
  .action((index, password, time) => {
    Ethereum.init();
    Ethereum.unlockAccount(Ethereum.accounts[index], password, time)
      .then(bool => {
        process.exit();
      })
      .catch(err => {
        console.error(err);
        process.exit();
      });
  });

/**
 * Start a gethdev server
 */

program
  .command('gethdev [args..]')
  .action(args => {
    const childArgs = ['--dev'];


  });
  
program.parse(process.argv);