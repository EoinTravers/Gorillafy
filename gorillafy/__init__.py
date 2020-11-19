#!/usr/bin/env python
#-*- coding: utf-8 -*-
import re
import sys
import os
import webbrowser
from bs4 import BeautifulSoup
from jinja2 import Environment, FileSystemLoader

__version__ = '0.1.1'

def check_interactive():
    import __main__ as main
    return not hasattr(main, '__file__')


def read(fn: str, root: str='.'):
    '''Shortcut to read a file'''
    with open(os.path.join(root, fn), 'r') as f:
        contents = f.read()
    return contents


def extract_gorilla_div(page: str) -> str:
    '''Extract and preproccess the #gorilla HTML div
    Args:
        page: The html content of the page, as a string.
    Returns:
        body_html: The preprocessed contents of the #gorilla
                   element, as a string.
    '''
    # Get Gorilla bit from main page
    soup = BeautifulSoup(page, features='html.parser')
    g = soup.find('div', id='gorilla')
    lines = str(g).split('\n')[1:-1]
    # Replace 'src="stimuli/..."' elements
    for i, line in enumerate(lines):
        if line.find('stimuli/') > -1:
            new_line = re.sub('src=["\']stimuli/(.+)["\']',
                               "src=\"{{ stimuli '\\1' }}\"",
                               line)
            lines[i] = new_line
    body_html = '\n'.join(lines)
    # Run through BeutifulSoup to prettify
    body_html = (BeautifulSoup(body_html, features="html.parser")
                 .prettify().replace('\n ', '\n    '))
    return body_html


def get_library_links(page: str, kind: str) -> (list, list, str):
    '''Generate contents of the Gorilla Head tab, linking to external libraries
    Args:
        page: index.html, as a string.
        kind: Which type of libraries to get, 'js', or 'css'.
    Returns:
        paths: List of libraries found
        necessary_paths: List of libraries that should be processed
        resources: HTML string linking to the relevant libraries
    '''
    js_tag_template = '<script src="{{resource \'%s\' config=content.config}}"></script>'
    css_tag_template = "<link href=\"{{resource '%s' config=content.config}}\" rel=\"stylesheet\"/>"
    if kind == 'js':
        tag = 'script'
        attr = 'src'
        excl_dir = 'js'
        tag_template = js_tag_template
    elif kind == 'css':
        tag = 'link'
        attr = 'href'
        excl_dir = 'style'
        tag_template = css_tag_template
    else:
        raise ValueError("kind must be either 'js' or 'css'")
    soup = BeautifulSoup(page, features='html.parser')
    files = soup.find('head').findAll(tag)
    paths = [f.attrs[attr] for f in files]
    if len(paths) == 0:
        return ''
    paths = [path for path in paths if path.find(excl_dir) != 0]
    if len(paths) == 0:
        return ''
    print('%s Libraries found: %s ' % (kind, repr(paths)))
    # jQuery and bootstrap already loaded by Gorilla
    necessary_paths = [path for path in paths
                       if path.find('jquery') == -1
                       and path.find('bootstrap') == -1]

    resources = '\n'.join([tag_template % os.path.split(p)[1]
                           for p in necessary_paths])
    return paths, necessary_paths, resources


def get_page_metrics(contents: str, verbose=False)-> list:
    '''Get the keys of the 'state' object in main.js'''
    contents = contents.split('\n')
    ix0 = None
    for i, line in enumerate(contents):
        if re.search('let state = {', line):
            ix0 = i+1
            depth = 1
            continue
        if ix0 is not None:
            if re.search('{', line):
                depth += 1
            if re.search('}', line):
                depth -= 1
            if depth == 0:
                ix1 = i
                break
    state_code = contents[ix0:ix1]

    def get_metric(line):
        m = re.findall('([a-z].+):', line)
        if len(m) > 0:
            return m[0]

    metrics = [get_metric(line) for line in state_code]
    metrics = [m for m in metrics if m is not None]
    return metrics


def gorillafy(target_directory: str,
              output_file=None, view=True):
    '''Generate guide to uploading an experiment to Gorilla.

    Args:
        target_directory: The folder containing the experiment
        output_file: File to write the guide to.
                Defaults to os.path.join(target_directory, 'gorillafy.html')
        view: Open the guide in the web browser?
    Returns
        None
    '''
    # Get path to templates
    if check_interactive():
        this_dir = os.path.realpath('.')
    else:
        this_dir = os.path.dirname(os.path.realpath(__file__))
    template_dir = os.path.join(this_dir, 'resources')

    env = Environment(loader = FileSystemLoader(template_dir))
    metrics_template = env.get_template('add_metrics.js')
    main_template = env.get_template('main.html')

    root_dir = os.path.abspath(target_directory)
    print('Target: ', root_dir)

    page = read('index.html', root_dir)
    utils_js = read('js/utils.js', root_dir)
    main_js = read('js/main.js', root_dir)
    main_css = read('style/main.css', root_dir)
    stim_dir = os.path.join(root_dir, 'stimuli')
    if os.path.exists(stim_dir):
        stim_files = os.listdir(stim_dir)
    else:
        stim_files = []

    body_html = extract_gorilla_div(page)

    js_paths, js_necessary_paths, js_resources = get_library_links(page, 'js')
    css_paths, css_necessary_paths, css_resources = get_library_links(page, 'css')
    necessary_paths = js_necessary_paths + css_necessary_paths
    necessary_paths = [os.path.normpath(os.path.join(root_dir, path))
                       for path in necessary_paths]

    try:
        metrics = get_page_metrics(main_js, verbose=True)
    except:
        metrics = '"[Error: Something went wrong when reading metrics from %s]"' % (
            os.path.join(root_dir, 'js/main.js'))
    metrics_code = metrics_template.render(metric_list = metrics)

    output = main_template.render(
        root_dir=root_dir, utils_js=utils_js,
        main_js=main_js, body_html=body_html,
        main_css=main_css, stim_files=stim_files,
        metrics_code=metrics_code,
        js_paths=js_paths,
        css_paths=css_paths,
        necessary_paths=necessary_paths,
        js_resources=js_resources,
        css_resource=css_resources
    )

    if output_file is None:
        output_file = os.path.join(root_dir, 'gorillafied.html')
    print('Writing to %s' % output_file)
    with open(output_file, 'w') as f:
        f.write(output)
    if view:
        webbrowser.open(output_file, new=2)
