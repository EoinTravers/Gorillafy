function Ready(){
    window['code_sections'] = $('pre > code').toArray().map( el => $(el).html() );
    let copy_id = 0;
    $('pre').css('margin-top', '.1em')
        .each(
            function(){
                $(this).attr( 'data-copyid', copy_id)
                    .wrap( '<div class="pre-wrapper"/>');
                //$(this).parent().css( 'margin', $(this).css( 'margin') );
                $('<button class="copy-snippet">Copy Code Below</button>')
                    .insertBefore( $(this) )
                    .attr('target', copy_id );
                copy_id++;
            });
    $('button.copy-snippet').on('click', function(e){
        let target = $(this).attr('target');
        console.log(target);
        Copy(target);
    });
    // Now style them
    hljs.initHighlighting();
}

function Copy(id){
    let text = window['code_sections'][Number(id)];
    console.log(text);
    let dummy = $('<textarea>').attr('id', 'dummy').val(text).appendTo('body').select();
    document.execCommand('copy');
    $('#dummy').remove();
}

$(document).ready(Ready);
