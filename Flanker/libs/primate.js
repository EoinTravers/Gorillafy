// primate.js - Not just Gorilla

// If running in Gorilla, primate.js provides verbose wrappers to the
// Gorilla API. Otherwise, it provides alternative functions that do
// the same things outside of gorilla. This means you can run the same
// code with and without Gorilla.

// See https://gorilla.sc/support/api/gorilla for documentation on the
// original API. Note that primate.finish() does not work in the same
// way as gorilla.finish(). See the code below for details.

const primate = (function(){
    function is_gorilla(){
        // To test whether we're running on Gorilla, we just test if
        // window['gorillaClient'] exists. There's probably a better
        // way to do this.
        return window['gorillaClient'] != undefined;
    }

    window['mute_primate'] = false;
    function mute() {window['mute_primate'] = true;};
    function unmute() {window['mute_primate'] = false;};
    function say(x, monkey=true){
        if(window['mute_primate']==false){
            // Cuter logging - 🦍 🙉 🐒
            if(monkey){
                // Speaker is a gorilla if running on Gorilla.
                // Otherwise, it's a monkey. Fun, no?
                let icon = is_gorilla() ? '🦍: ' : '🙉: ';
                console.log(icon + x);
            } else {
                console.log(x);
            }
        }
    }

    // Start of core functions
    function ready(cb){
        say(`Setting '${cb.name}()' to run once page is ready.`);
        if(is_gorilla()){
            gorilla.ready(cb);
        } else {
            if (document.readyState === 'complete') {
                // We're already ready
                cb();
            }
            else {
                $(document).ready(cb);
            };
        }
    }

    function manipulation(string, def){
        // We can't retrieve anything, so just use the default.
        say(`Getting value of manipulation '${string}'`);
        let val;
        if(is_gorilla()){
            val = gorilla.manipulation(string, def);
            say(`${string} = ${val}`);
            if(val == def){
                say('This is the default value. Coincidence, or bug?');
            }
        } else{
            say(`Using default: ${string} = ${def}`);
            val = def;
        }
        return val;
    }

    // For store and retrieve, use localStorage.
    // Since localStorage saves everything as a string,
    // save a supplementary entry indicating what the type should be,
    // and use _to_type() to cooerce the value as appropriate.
    function _to_type(value, type_string){
        if(type_string=='object') { return JSON.parse(value); }
        if(type_string=='number') { return Number(value); }
        if(type_string=='string') { return value; }
        if(type_string=='boolean') { return Boolean(value); }
    }

    function store(key, value, global=true){
        say(`Storing ${key} = ${value} (global = ${global})`);
        if(is_gorilla()){
            gorilla.store(key, value, global);
        } else {
            say('...falling back to localStorage.');
            localStorage[key] = value;
            localStorage[key + '_type'] = typeof(value);
        }
    }

    function storeMany(values, global){
        for(k in values){
            store(k, values[k]);
        }
    }

    function retrieve(key, def=undefined, global=true){
        say(`Retrieving value of ${key} (global = ${global})`);
        let val;
        if(is_gorilla()){
            val = gorilla.retrieve(key, def, global);
        } else {
            say('...falling back to localStorage');
            let type_string = localStorage[key + '_type'];
            val = localStorage[key];
            val = _to_type(val, type_string);
        }
        say(`${key} = ${val}`);
        if(typeof val == 'undefined') {
            say(`...Replacing with default value: ${def}`);
            val = def;
        }
        return val;
    }

    function metric(results){
        say('Sending these metrics to the server:');
        console.log(results);
        if(is_gorilla()){
            gorilla.metric(results);
        } else {
            say('...falling back to AJAX');
            $.ajax({
                type: 'POST',
                url: 'log.php',
                data: JSON.stringify(results),
                success: function(res) { console.log(res); }
            });
        }
    }

    function stimuliURL(name){
        say(`Getting stimulus url for '${name}'`);
        if(is_gorilla()){
            let url = gorilla.stimuliURL(name);
            say('Found ' + url);
            return url;
        } else {
            say(`...falling back to 'stimuli/${name}`);
            return 'stimuli/' + name;
        }
    }

    function fy_shuffle(array) {
        // Fisher-Yates algorithm in pure JavaScript, from
        // https://stackoverflow.com/a/2450976
        // This code is covered by a Creative Commons license
        var currentIndex = array.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }
    function shuffle(x){
        // say('Shuffling...'); // Probably not necessary
        if(is_gorilla()){
            gorilla.shuffle(x);
        } else {
            return fy_shuffle(x);
        }
    }

    function populate(element, template, content={}){
        if(is_gorilla()){
            say(`Populating ${element} with template '${template}`);
            say(`(Contents: ${content})`);
            return gorilla.populate(element, template, content);
        } else {
            say(`Skipping call to populate()`);
        }
    }
    function populateAndLoad(element, template, content, cb){
        if(is_gorilla()){
            say(`Populating ${element} with template '${template}`);
            say(`(Contents: ${content})`);
            say(`Callback: ${cb.name}`);
            return gorilla.populateAndLoad(element, template, content);
        } else {
            say(`Skipping call to populateAndLoad()`);
        }
    }

    function finish(URL, redirect_gorilla=false){
        // primate.finish() differs from gorilla.finish().

        // Calling `primate.finish()` without any arguments will raise
        // a pop-up window when running off Gorilla, and will redirect
        // to the next node on Gorilla. This is the default behaviour
        // of `gorilla.finish()`.

        // Calling `primate.finish('example.com')` will redirect the
        // participant to example.com if the experiment is running off
        // Gorilla, but will send them to the next node in Gorilla.

        // Calling `primate.finish('example.com', true)` will redirect
        // to example.com even if running on Gorilla. You probably
        // don't want to do this!
        say('End of experiment!');
        if(is_gorilla()){
            if(redirect_gorilla){
                say(`Redirecting to ${URL}`);
                gorilla.finish(URL);
            } else {
                gorilla.finish();
            }
        } else {
            if(typeof URL !== 'undefined')  {
                say(`Redirecting to ${URL}`);
                window.location.href = URL;
            } else {
                alert('End of Experiment!');
            }
        }
    }

    let exports = {
        mute: mute, unmute: unmute,
        say: say,
        is_gorilla: is_gorilla,
        ready : ready,
        manipulation : manipulation,
        retrieve : retrieve,
        store : store,
        storeMany : storeMany,
        metric : metric,
        stimuliURL : stimuliURL,
        shuffle : shuffle,
        populate : populate,
        populateAndLoad : populateAndLoad,
        finish: finish,
        version: '0.0.1'
    };
    return exports;
})();
