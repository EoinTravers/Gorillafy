function Ready(){
    // Automatic select and copy
    // window['code_sections'] = $('pre > code').toArray().map( el => $(el).html() );
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
        let target_id = $(this).attr('target');
        console.log(target_id);
        let element = $('pre > code')[target_id];
        CopyElement(element);
        // Copy(target);
    });
    // Now style them
    hljs.initHighlighting();
}

function CopyElement(element) {
    // From https://stackoverflow.com/a/987376/1717077
    if (document.body.createTextRange) {
        let range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (document.createRange) {
        let selection = window.getSelection();
        let range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    } else if (window.getSelection) {
        let selection = window.getSelection();
        selection.setBaseAndExtent(element, 0, element, 1);
    }
    document.execCommand('copy');
}

// function Copy(id){
//     let text = window['code_sections'][Number(id)];
//     console.log(text);
//     let dummy = $('<textarea>').attr('id', 'dummy').val(text).appendTo('body').select();
//     document.execCommand('copy');
//     $('#dummy').remove();
// }

$(document).ready(Ready);
