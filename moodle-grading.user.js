// ==UserScript==
// @name        Moodle Grading Helper
// @description
// @require     https://code.jquery.com/jquery-2.1.0.min.js
// @version     0.2.2
// @match       https://moodle.nmt.edu/*
// @copyright   Christopher Koch
// ==/UserScript==

// TODO: check against csv grader sheet
// TODO: should work on the all users overview page

if(/.*mod\/assignment\/submissions\.php*/.test(window.location.href)) {
    addGradeCheckingButton();
}

function addGradeCheckingButton()
{
    $('<div style="text-align: center; font-size: 1.2em; font-weight: bolder;"><a href="javascript: void(0);" id="gcheck">Check All Grading</a></div>').insertBefore('table#attempts');
}

$('#gcheck').on(
    "click",
    function doGradeCheck(zEvent)
    {
        $('#ungraded').remove();

        var ungraded = {
            'regular' : [],
            'no submission' : [],
            'resubmissions' : []
        };

        $("table#attempts tr").each(function(i, tr) 
        {
            var name = $('td.fullname a', tr).text();

            var timesub = new Date(Date.parse($('td.timemodified div', tr).clone().children().remove().end().text()));
            var timegraded = new Date(Date.parse($('td.timemarked div', tr).text()));

            if(timegraded.getTime() < timesub.getTime())
                ungraded['resubmissions'].push(name);

            if($('td.grade select', tr).val() == -1) {
                if(!($('td.timemodified div', tr).text().match(/\S/)))
                    ungraded['no submission'].push(name);
                else
                    ungraded['regular'].push(name);    
            }
        });

        $('head').append('<style type="text/css">' + 
                         '#ungraded ul { width: 95%; margin-bottom:10px; margin-left: auto; margin-right: auto; overflow: hidden; }' + 
                         '#ungraded li { line-height: 1.5em; float: left; display: inline; width: 25%; }'+
                         '</style>');

        var newhtml = '<div id="ungraded">';
        var any = 0;
        for(var type in ungraded) {
            if(ungraded[type].length > 0) {
                any = 1;
                newhtml +=  '<h3>Ungraded (' + type + ')</h3><ul>';
                for(var i = 0; i < ungraded[type].length; i++)
                    newhtml += '<li>' + ungraded[type][i] + '</li>';
                    newhtml += '</ul>';
            }
        }
        if(any == 0) {
            newhtml += '<h3>No ungraded assignments</h3>'; 
        }
        newhtml += '</div>';
        $(newhtml).insertBefore('table#attempts');
    }
);
