var channels;

function onload() {
    $('#codeInput').focus();

    $('#audio').on('loadeddata loadstart waiting playing', function() {
        if($('#audio')[0].readyState != 4) {
            $('.live__playing').hide();
            $('.live__loading').show();
            $('.live__status').text('Загрузка данных трансляции...');
        }
        else {
            $('.live__playing').show();
            $('.live__loading').hide();
            $('.live__status').text('Идет трансляция...');
        }
    });

    $('#audio').on('error ended', function(error) {
        changeChannel();
    })
}

function submitCode() {
    $('#audio')[0].play();
    var code = $('#codeInput').val();
    $('.submit-button').attr('disabled','disabled');
    $('#error').html('');
    $.post('http://localhost:3000/check-code', {code: code}, function(e) {
        $('.submit-button').removeAttr('disabled');
        if(!e.ok) {
            $('#error').html(e.error);
        }
        if(e.ok) {

            $('#error').html('');
            $('.signin').hide();
            $('.live').show();

            $('.live__channel-name option').remove();
            e.channels.forEach(function(i) {
                $('.live__channel-name').append('<option value="'+i.url+'">'+i.name+'</option>');
            });
            $('.live__channel-name option:first-child').attr('selected','selected');

            changeChannel();
            changeListenersCount();


        }
    }).fail(function() {
        $('.submit-button').removeAttr('disabled');
        $('#error').html('Произошла ошибка. Попробуйте чуть позже.');
    });
    return false;
}

function stop() {
    $('.signin').show();
    $('.live').hide();
    $('#audio')[0].pause();
    $('#mp3-source')[0].removeAttribute('src');
    $('#audio')[0].load();
    $('.live__channel-name option').remove();
}

function changeChannel() {

    $('#audio')[0].pause();
    $('#mp3-source')[0].removeAttribute('src');
    $('#audio')[0].load();

    var channel = $('.live__channel-name option:selected').val();
    if(!channel) {
        return;
    }

    $('.live__status').text('Подключение...');

    var xhr = new XMLHttpRequest();
    xhr.open('GET', channel);
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 3) {
            if (xhr.status == 200) {
                $('#mp3-source')[0].src = channel;
                $('#audio')[0].load();
            } else {
                $('.live__status').text('Трансляция недоступна. Повторное подключение...');
                setTimeout(changeChannel, 5000);
            }
            xhr.abort();
        }

    };
    xhr.addEventListener("error", function(e) {
        setTimeout(changeChannel, 5000);
    });
    xhr.send();

}

function changeListenersCount() {
    var listeners = $('.live__listeners input').val();
    var code = $('#codeInput').val();
    $.post('http://localhost:3000/update-listeners-count', {code: code, listeners: listeners});
}