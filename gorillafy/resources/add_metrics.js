metrics = {{ metric_list }};

function click_button(){
    console.log('click_button');
    $('button').filter('.gorilla-metrics-add').trigger('click');
    setTimeout(write_fields, 100);
}

function write_fields(){
    let metric = metrics.pop();
    console.log(metric);
    $('div[data-field="key"] > input'  ).last().val(metric).trigger('change');
    $('div[data-field="title"] > input').last().val(metric).trigger('change');
    if(metrics.length > 0) {
        setTimeout(click_button, 100);
    }
};

click_button();
