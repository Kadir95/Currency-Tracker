var sync_request = require("request-sync");
var notifier = require("node-notifier");
var play = require("play-sound")(opts = {});

bloomberg = 'https://www.bloomberg.com:443/markets/api/security/currency/cross-rates/';
cryptocompare = ["https://min-api.cryptocompare.com/data/pricemulti?fsyms=", "&tsyms="];

function currency(from, to){
    //console.log("Currency function convert " + from + " to " + to);
    req = bloomberg + from + "," + to;

    var res = sync_request(req, "GET");
    //console.log("Currency function value : " + res.body);
    return JSON.parse(res.body);
}

function cryp_currency(from, to){
    //console.log("Cryp_currency function convert " + from + " to " + to);
    req = cryptocompare[0] + from + cryptocompare[1] + to;

    //console.log("Cyrp_currency request to : " + req)

    var res = sync_request(req, "GET");

    return JSON.parse(res.body);
}

function update_lastest_values(curr, value){
    console.log(curr + ": " + value);

    if (lastest_values[curr] != null){
        if (value > lastest_values[curr]){
            notifier.notify({
                title: curr + " rises",
                message: curr + "'s price rises from " + lastest_values[curr] + " to " + value + " (" + (value - lastest_values[curr]) + ")"
            });

            play.play("./sounds/rise.mp3", function(err){
                if(err != null){
                    console.log("Error : " + err);
                }
            });
        } else if(value < lastest_values[curr]){
            notifier.notify({
                title: curr + " falls",
                message: curr + "'s price falls from " + lastest_values[curr] + " to " + value + " (" + (value - lastest_values[curr]) + ")"
            });

            play.play("./sounds/down.mp3", function(err){
                if(err != null){
                    console.log("Error : " + err);
                }
            });

        }
    }

    if(highest_values[curr] != null){
        if (value > highest_values[curr]){
            notifier.notify({
                title: "New highest for " + curr,
                message: curr + "'s price rises from " + highest_values[curr] + " to " + value + " (" + (value - highest_values[curr]) + ")"
            });

            highest_values[curr] = value;
        }
    } else {
        highest_values[curr] = value;
    }

    lastest_values[curr] = value;
}

highest_values = {};
lastest_values = {};
currencies = ["USD", "EUR", "GBP", "RUB"];
currency_to = "TRY";
cryp_currencies = ["BTC", "ETC"];

update_rate = 10000;

function main(){
    var date = new Date();
    console.log("|------" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "------|");
    
    for (var i in currencies){
        var value = null;
        try {
            value = currency(currency_to, currencies[i])["data"][currencies[i]][currency_to];
        } catch(err) {
            console.log("Error : " + err);
            continue;
        }

        update_lastest_values(currencies[i], value);
    }

    for (var i in cryp_currencies){
        var value = null;
        try {
            value = cryp_currency(cryp_currencies[i], currencies[0])[cryp_currencies[i]][currencies[0]];
            value = value * lastest_values[currencies[0]];
        } catch(err) {
            console.log("Error : " + err);
            continue;
        }
        
        update_lastest_values(cryp_currencies[i], value);
    }
}

main();
setInterval(main, update_rate);