//CMPE 172 Midterm Coding portion

var orders = {};
var exchange = {rates: {}};
var rate;
var request = require('request');
var repl = require('repl');
var uu = require('underscore');
var csvgen = require('csv-generate');
var fastcsv = require('fast-csv');
var csv = require('csv');
var fs = require('fs');

console.log('Bitcoin Market \n ---- Main Menu ---- \n 1. Purchase: Buy <amount> <currency> \n 2. Sell: Sell <amount> <currency> \n 3. List: View current orders. \n 4. Export: Sends your current orders to a .CSV file. \n 5. Exit: Quit the program. \n');

repl.start({
  prompt: 'coinbase: ', 
  eval: function(cmd, context, filename, callback){
      var input = cmd.toLowerCase().replace('(','').replace(')','').replace('\n', '').split(' ');
      var id = new Date().toString();
      var amount = parseFloat(input[1]);
      var abbrev = 'BTC';

      switch(input[0]){          
        case 'buy':
          request('https://api.coinbase.com/v1/currencies/exchange_rates', function(error, response, body){
            if (!error){exchange.rates = JSON.parse(body);}
          });
            if (typeof(input[2]) != 'undefined') {abbrev = input[2].toUpperCase();}
            if (typeof(input[3]) != 'undefined') {priceCeiling = parseFloat(input[3]);}
            if (!amount) {callback('Please enter specific amount.');
              break;
            } 
            if (abbrev != 'BTC') {
              var origcurr = amount;
              var rate = exchange.rates['btc_to_' + abbrev.toLowerCase()];

             if (typeof(rate) != 'undefined') {
                orders[id] = {
                    type: 'buy', 
                    amount: amount,
                    abbrev: abbrev
                };
                var btctotal = (amount/rate);
                callback('Order: Buy ' + amount.toString() + ' ' + abbrev + ' in BTC at ' + rate + ' BTC/' + abbrev + ' (' + amount + ' BTC/USD/EUR) Cost = ' + btctotal);
              } else {
               console.log('Error: There was no exchange rate for BTC to ' + abbrev + '. Order failed.');
                }
            } else {
              orders[id] = {
                  type: 'buy',
                  amount: amount,
                  abbrev: abbrev
              };
              callback('Order: Buy ' + amount.toString() + ' BTC added to the queue.');
            }
          break;

          case 'sell':
            request('https://api.coinbase.com/v1/currencies/exchange_rates',function(error, response, body){
              if (!error){exchange.rates = JSON.parse(body);}});
              if (typeof(input[2]) != 'undefined') {abbrev = input[2].toUpperCase();}
              if (typeof(input[3]) != 'undefined') {priceCeiling = parseFloat(input[3]);}
              if (!amount) {callback('Please enter specific amount.');
                break;
              } 
              if (abbrev != 'BTC'){
                var origcurr = amount;
                var rate = exchange.rates['btc_into_' + abbrev.toLowerCase()];
                if (typeof(rate) != 'undefined'){
                  orders[id] = {
                  type: 'sell',
                  amount: amount,
                  abbrev: abbrev
                };
                var btctotal = (amount / rate);
                callback('Order: Sell ' + amount.toString() + ' ' + abbrev + ' in BTC at ' + rate + ' BTC/' + abbrev + ' (' + amount + ' BTC/USD/EUR) Cost = ' + btctotal);
              } else {
               console.log('Error: There was no exchange rate for BTC/' + abbrev + '. Order failed.');
              }

            } 
            else {
              orders[id] = {
                  type: 'sell',
                  amount: amount,
                  abbrev: abbrev
              };

              callback('Order: Sell ' + amount.toString() + ' BTC added to the queue.');
            }
          break;

          case 'list':
           console.log('--- ORDERS ---');
           Object.keys(orders).forEach(function(id) 
           {
              var user_order = orders[id];
              console.log(id + ' : ' + user_order.type.toUpperCase() + ' ' + user_order.amount + ' : Unfilled');
           }); 
           break;
   
          default:
          console.log('Uknown command: "' + cmd + '" entered'); 
          break;
          break;

          case 'export':
          var top = ["Buy or Sell", " Amount", " Currency"];
          var string = csv.stringify({header: true, columns: top}); 
          Object.keys(orders).forEach(function(id) 
          {
              var user_order = orders[id];
              var result = (id + ' : ' + user_order.type.toUpperCase() + ' ' + user_order.amount + ' : Unfilled');

          var generator = csvgen({columns: ['int', 'bool'], length: 2}); //npm install csv-generate
              generator.pipe(csv.transform(function(){
                return Object.keys(orders[id]).map(function(key, value){
                  return orders[id][key]
                })
              })).pipe(string).pipe(fs.createWriteStream('results.csv', {flags: 'w'}));
          });

          callback('data exported to .CSV file.');
          break;

          case 'exit':
          console.log('Exiting the program');
          process.exit(1);
          break;
        }
      }
});










