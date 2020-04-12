        head_index = 0;
        body_index = 0;

        function change(imageId, direction) {
            if(imageId.includes('head')) {
                if(direction == 'left') {
                    head_index--;
                    if(head_index == -1) {
                        head_index = head_array.length - 1;
                    }
                } else {
                    head_index++;
                    if(head_index == head_array.length) {
                        head_index = 0;
                    }
                }
            } else {
                if(direction == 'left') {
                    body_index--;
                    if(body_index == -1) {
                        body_index = body_array.length - 1;
                    }
                } else {
                    body_index++;
                    if(body_index == body_array.length) {
                        body_index = 0;
                    }
                }
            }

            display();
        }

        function random() {
            head_index = Math.floor(Math.random() * head_array.length);
            body_index = Math.floor(Math.random() * body_array.length);
            display();
        }

        function display() {

            head = head_array[head_index];
            body = body_array[body_index];

            // Add Head Value
            headText = head['Text'];
            incrATK = 0;
            incrHP = 0;
            incrDEF = 0;
            if(headText.includes("[DEF]")) {
                headText = headText.replace(/\+ /, '').replace(/ \[DEF\]/, '');
                incrDEF = parseInt(headText);
                headText = "";
            } else if(headText.includes("[ATK]")) {
                headText = headText.replace(/\+ /, '').replace(/ \[ATK\]/, '');
                incrATK = parseInt(headText);
                headText = "";
            } else if(headText.includes("[HP]")) {
                headText = headText.replace(/\+ /, '').replace(/ \[HP\]/, '');
                incrHP = parseInt(headText);
                headText = "";
            } else {
                headText = headText.replace(/\+ /, '') + ". ";
            }

            // Set Title
            $(body_Name).html(body['name']);
            $(head_Name).html(head['name']);

            // Set Body Mode Stats
            $(body_ATK).html(body['bodyATK'] + incrATK);
            $(body_HP).html(body['HP'] + incrHP);
            $(body_DEF).html(body['bodyDEF'] + incrDEF);
            $(body_Text).html(body['bodyText'] + "<b>" + headText + "</b>");

            // Set Alt Mode Stats
            $(alt_ATK).html(body['ATK'] + incrATK);
            $(alt_HP).html(body['HP'] + incrHP);
            $(alt_DEF).html(body['DEF'] + incrDEF);
            $(alt_Text).html(body['Text'] + "<b>" + headText + "</b>");

            // Set Stars
            $(star_count).html(body['Stars'] + head['Stars']);

            // Set Images
            document.getElementById('tfbody-img').src = "images/bodies/" + body['id'] + ".bot.png";
            document.getElementById('tfhead-img').src = "images/heads/" + head['id'] + ".png";
        }
