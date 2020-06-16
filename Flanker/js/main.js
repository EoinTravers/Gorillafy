// static/main.js
// The main logic for our task.
"use strict";

// We follow a rule of only creating two global variables.

// `globals` is an object containing any information we want to make
// gloabally available in the task. `state` is an object containing
// information that is globally available, AND which will be sent to
// the server at the end of each trial;

// We populate both with default values now, so we can know at a
// glance what values they can store. This is better than adding new
// values on an ad-hoc basis, which often leads to bugs.

let globals = {
    resp_keys: [70, 74], // F, J
    fixation_time: 1000,
    feedback_time: 2000,
    n_trials: 12
};

let state = {
    // `width` and `height` get updated every time the window is resized.
    width: null,
    height: null,
    subject_nr: get_subject_nr(),
    target_size: null, // Between-subject manipulation
    trial_nr: 0,
    t_start_experiment: null,
    t_start_trial: null,
    t_response: null,
    target_right: null,
    flanker_right: null,
    response: null,
    said_right: null,
    rt: null,
    accuracy: null
};

// When everything's loaded, call the `Ready` function
primate.ready(Ready);

// We break the logic of the task up into individual functions, named
// using CapsCase. Each function either calls the next one
// immmediately, calls it after a delay, or tells the page to wait for
// some user input before triggering the next function.
function Ready(){
    // If you need to do any logic before begining, put it here.
    // This line is necessary for running on Gorilla,
    // but does nothing otherwise.
    primate.populate('#gorilla', 'body', {});
    // Hide everything we don't want to see yet
    $('#gorilla').children().hide();
    on_resize();  // Check window size now
    $( window ).resize(_.debounce(on_resize, 100)); // And every time it changes
    $('#gorilla').show();
    state.t_start_experiment = Date.now();
    // Get the manipulation if running on Gorilla. Flip a coin otherwise.
    let target_size = state.target_size = primate.manipulation(
        'target_size', _.sample(['2.5', '7.5']));
    target_size = target_size + 'vh';
    $('#target, #target > img').css('height', target_size);
    $('#start').show();
    bind_to_key(PrepareTrial, 32);  // 32 = spacebar
};

function PrepareTrial(){
    // Prepare stimuli and show fixation
    $('#start').hide();
    state.target_right = flip();
    state.flanker_right = flip();
    let inner = state.target_right ? 'right' : 'left';
    let outer = state.flanker_right ? 'right' : 'left';
    $('img.flanker').attr('src', primate.stimuliURL(outer+'.svg'));
    $('img.target').attr('src', primate.stimuliURL(inner+'.svg'));
    $('#fix').show();
    // Wait, then start trial
    setTimeout(StartTrial, globals.fixation_time);
};

function StartTrial(){
    // Hide fixation, show target, note time, and bind next stage to
    // the spacebar
    $('#fix').hide();
    $('#target').show();
    state.t_start_trial = Date.now();
    $(document).off('keydown').on('keydown', CheckResponse);
};

function CheckResponse(e){
    // This is the cross-browser way of getting the key code
    let k = (typeof e.which == "number") ? e.which : e.keyCode;
    if(globals.resp_keys.indexOf(k) > -1){ ProcessResponse(k); };
}

function ProcessResponse(k){
    $(document).off('keydown');
    let t = state.t_response = Date.now();
    $('#target').hide();
    state.response = k;
    state.rt = state.t_response - state.t_start_trial;
    let said_right = state.said_right = Number(k == globals.resp_keys[1]);
    let accuracy = state.accuracy = Number(state.target_right == said_right);
    if(accuracy){
        LogData();
    } else {
        ErrorFeedback();
    }
}

function ErrorFeedback(){
    $('#feedback').show();
    setTimeout(LogData, globals.feedback_time);
}

function LogData(){
    $('#feedback').hide();
    primate.metric(state);
    state.trial_nr +=1;
    if(state.trial_nr >= globals.n_trials){
        EndExperiment();
    } else {
        PrepareTrial();
    }
}

function EndExperiment(){
    $('#end').show();
    // Redirect in 3 seconds (if not running on Gorilla)
    setTimeout( e => primate.finish('https://imgur.com/r/puppies'), 3000);
}
