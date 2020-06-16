# Gorillafy

`gorillafy` is a tool for turning HTML/JavaScript experiments into
tasks on [Gorilla.sc](https://gorilla.sc/),
via the [Gorilla Code Editor](https://gorilla.sc/info/code-editor/).

To install, run

```bash
pip install git+https://github.com/EoinTravers/Gorillafy
```

To use it at the command line, run

```bash
gorillafy path/to/Experiment/
```

replacing `path/to/Experiment/` with the directory of your experiment.

You can try it out by downloading this repository
and `gorillafy`ing the `Flanker/` demo experiment:

```bash
gorillafy Flanker/
```
To `gorillafy` your own experiment,
you'll need to follow a few simple conventions when building them.
See the demo experiment in the `Flanker/` folder for an example.

## Directory structure

- `index.html`: Your experiment's HTML page.
- `js/`: JavaScript code for your experiment, split into
  - `main.js`: The main logic of the experiment, and
  - `utils.js`: Useful utility functions.
- `style/main.css`: The CSS for your experiment.
- `libs/`: JavaScript and CSS libraries used in your experiment (e.g. lodash, jQuery).
- `stimuli/`: Any media (images, etc.) used in the experiment.

In `index.html`, wrap all of your experiment content inside a `<div>` tag with ID `gorilla`.
Everything inside this tag will be copied to Gorilla.

In `main.js`, you'll see that all of the information want to log on each trial
is stored in a single global variable, `state`, defined at the start of the file:

```js
let state = {
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
```

`gorillafy` will use the the keys defined here
to tell Gorilla what metrics it should record.

## `primate.js`

`primate.js` is a simple JavaScript package
that provides the same functions as the [Gorilla API](https://gorilla.sc/support/api/gorilla).
When run on the Gorilla platform,
`primate.js` just calls the corresponding Gorilla functions,
and provides some useful output for debugging.
When run on a normal web page, it provides alternatives for these functions,
for instance allowing you to send data to the server.
This means you can run exactly the same code on and off Gorilla.
See [the Flanker demo](./Flanker/js/main.js) for examples.
