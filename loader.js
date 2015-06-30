//settings
var rankfilter = true;
var local = false;//true if on local machine, false if on same server (Google Drive)
//end settings

var output;
var root;
var ranks;
var ranksList = [];
var rOutput;
var roles = null;
var roster = null;
var players;
var badges;
var emptyplayer;

var ranksCheck = false;
var rosterCheck = false;

var toLoad = 2;
var loaded = 0;
var toparse = 5;
var parsed = 0;
var loadingStatus = "Waiting for files to download.";

loadRanks();
loadOrbatDoc("orbat.json");

function loadOrbatDoc(file)
{
    var xmlhttp;
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200)
        {
            loaded++;
            updateLoader();
            try {
                roster = JSON.parse(xmlhttp.responseText);
                rosterCheck = true;
                checkReady();
            } catch (error) {
                loadingStatus = "Parsing error file is not valid.";
                updateLoader();
                console.log(error + " Error in 27thSM");
            }
        }
    };
    var pad = file;
    if (local) {
        //change this when testing localy
        pad = "http://googledrive.com/host/0B8deNilWQGq2a3VUSHlLdldUbFE/" + file;
    }
    xmlhttp.open("GET", pad, true);
    xmlhttp.send();
}

function loadRanks() {
    var xmlhttp;
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200)
        {
            loaded++;
            updateLoader();
            try {
                ranks = JSON.parse(xmlhttp.responseText);
                ranksCheck = true;
                checkReady();
            } catch (error) {
                loadingStatus = "Parsing error file is not valid.";
                updateLoader();
                console.log("" + error + " Error in Ranks");
            }
        }
    };
    var pad = "Ranks.json";
    if (local) {
        //change this when testing localy
        pad = "http://googledrive.com/host/0B8deNilWQGq2a3VUSHlLdldUbFE/Ranks.json";
    }
    xmlhttp.open("GET", pad, true);
    xmlhttp.send();
}

function checkReady() {
    if (ranksCheck && rosterCheck) {
        drawORBAT();
    }
}

function drawORBAT() {
    output = "";
    parsed = 0;
    loadingStatus = "parsing..";
    updateLoader();
    root = true;

    players = roster[3].enlisted;
    badges = roster[4].badges;
    roles = roster[5].roles;
    loadingStatus = "parsing Ranks.";
    updateLoader();
    parseRanks(ranks);
    parsed++;
    loadingStatus = "parsing Players.";
    updateLoader();
    parsePlayers();

    parsed++;
    loadingStatus = "parsing and drawing ORBAT.";
    updateLoader();
    drawUnit(roster[1]);

    output += '<div class="other">';
    parsed++;
    loadingStatus = "parsing and drawing Recuits.";
    updateLoader();
    drawRecuits(roster[0].recruits);
    parsed++;
    loadingStatus = "parsing and drawing Reserved.";
    updateLoader();
    drawReserved(roster[2].reserved);
    parsed++;
    loadingStatus = "Done.";
    updateLoader();
    output += '</div>';

    document.getElementById("orbatRoot").innerHTML = output;
}

//---------------------------------------
//----------------Roster-----------------
//---------------------------------------

function drawUnit(obj, commanderO, lengthParrent) {
    if (!(typeof obj.players === 'undefined')) {
        drawPLayers(obj, commanderO, lengthParrent);
    } else {
        output += '<div class="unit">';
        if (!root) {
            output += '<div class="hline"> \
                            <div class="lineC"></div>\
                        </div> \
                        <div class="line"> \
                            <div class="lineC"></div>\
                        </div>';
        } else {
            root = false;
        }
        commander = getPlayer(obj.commander);
        symbol = '<div class="symbol"><img class="symbolImg" alt="' + obj.symbol + '" src="img/' + obj.symbol + '"></div>';
        if(obj.symbol === ""){
            symbol = "";
        }
        output += '<div class="info"> \
                            <div class="size">' + unitsize(obj.size) + '<p class="hidden">' + obj.size + '</p></div> \
                            ' + symbol + '\
                            <p class="name">' + obj.name + '</p> \
                            <div class="extraInfo"> \
                                <p class="longName">' + obj.longName + '</p>';
        if (obj.callsign !== "") {//empty callsign
            output += '<p class="callsign">&lt;' + obj.callsign + '&gt;</p>';
        }
        output += drawPlayerExtraInfo(commander, 3);
        output += '</div>';
        if (obj.subUnits.length > 0) {
            output += '<div class="line"><div class="lineC"></div></div>';
        }
        output += '</div><div class="subUnits">';
        for (var i = 0; i < obj.subUnits.length; i++) {
            drawUnit(obj.subUnits[i], commander, obj.subUnits.length);
        }
        output += '</div></div>';
    }
}

function drawPLayers(obj, commander, lengthParrent) {
    output += '<div class="unit"><div class="hline"> \
                            <div class="lineC"></div>\
                        </div> \
                        <div class="line"> \
                            <div class="lineC"></div>\
                        </div>\n\
                    <ul class="players">';
    list = [];
    if (lengthParrent <= 1) {
        list = [commander];
    }
    for (var i = 0; i < obj.players.length; i++) {
        list.push(getPlayer(obj.players[i]));
    }
    for (var i = 0; i < list.length; i++) {
        player = list[i];
        extrainfo = "";
        output += '<li class="player';
        if (player !== emptyplayer) {
            output += " notopen";
        } else {
            output += " open";
        }
        output += '">\
                      <p class="Rank"><img class="Insignia" alt="insignia" src="img/' + player.rank.insignia + 
                '"/><img class="role" alt="role" src="img/' + player.role.icon + 
                '" title="' + player.role.role + '"/>' + player.rank.abbreviation + '</p> \
                      <p class="name">' + player.name + '</p> \
                      ' + drawPlayerExtraInfo(player, 1) + '\
                   </li>';
    }
    output += '</ul></div>';
}

function drawBadges(badges) {
    result = "";
    for (var i = 0; i < badges.length; i++) {
        result += '<div class="badge type' + badges[i].type + '" title="' + escapeQuotes(badges[i].discription) + '">' + badges[i].name + '</div>';
    }
    return result;
}

function drawRecuits(recs) {
    recs = getRecuitsList(recs);
    sortRecuitsByDate(recs);
    output += '<div class="rec"><h1>Recruits (' + recs.length + ') </h1><ul>';
    for (var i = 0; i < recs.length; i++) {
        player = recs[i];
        joinedDate = new Date(player.joined);
        var diffDay = getDaysWeek(joinedDate);
        var diffWeek = getWeeks(joinedDate);
        var color = "green";
        if (diffWeek === 3) {
            color = "orange";
        } else if (diffWeek >= 4) {
            color = "red";
        }
        var OP = "orange";
        if (player.lastOP !== "") {
            OP = "green";
        }
        output += '<li><div class="recruit"><div class="left name"><p class="Rank">'+ player.rank.abbreviation + '</p>' + player.name + '</div> <div class="right recinfo"><div class="date ' + color + '" title="' + joinedDate.getDate() + '/' + (joinedDate.getMonth() + 1) + '">' + diffDay + ' day(s), ' + diffWeek + ' week(s)</div>\
                    <div class="progress">\
                        <div class="' + OP + '" title="Official Operation">OP</div> \
                        <div class="' + colorHasBadge(player, "TFR") + '" title="Task Force Radio Training">TFR</div>\
                        <div class="' + colorHasBadge(player, "First Aid") + '" title="First Aid">FA</div> \
                        <div class="' + colorHasBadge(player, "Formations") + '" title="Formations">For.</div> \
                        <div class="' + colorHasBadge(player, "Bounding") + '" title="Bounding">Bou.</div> \
                        <div class="' + colorHasBadge(player, "Firerange") + '" title="Firerange">Fire.</div> \
                        <div class="' + colorHasBadge(player, "Fast-roping") + '" title="Fast-roping">Fast-R.</div> \
                    </div></div><div></li>';
    }
    output += '</ul></div>';
}

function colorHasBadge(player, gadge) {
    if (hasBadge(player, gadge)) {
        return "green";
    }
    return "orange";
}

function sortRecuitsByDate(recs) {
    for (var i = 0; i < recs.length; i++) {
        date1 = new Date(recs[i].joined);
        for (var j = 0; j < i; j++) {
            date2 = new Date(recs[j].joined);
            if (date1 > date2) {
                temp = recs[i];
                recs[i] = recs[j];
                recs[j] = temp;
            }
        }
    }
}

function getRecuitsList(recs) {
    recruits = [];
    for (var i = 0; i < recs.length; i++) {
        recruits.push(getPlayer(recs[i]));
    }
    return recruits;
}


//---------------------------------------
//----------------Extra Info-------------
//---------------------------------------


function showRanks() {
    drawRanks();
}

function drawRanks() {
    rOutput = "";
    rOutput += '<div class="ranks"><h1>Ranks</h1><h2>Enlisted</h2><ul>';
    for (var i = 0; i < ranks.Enlisted.length; i++) {
        if (ranks.Enlisted[i].inUse === "true" || !rankfilter) {
            rOutput += '<li><img class="Insignia" alt="Insignia" src="img/' + ranks.Enlisted[i].insignia + '"/>\n\
                            <div class="title">' + ranks.Enlisted[i].title + '</div>\n\
                            <div class="abbreviation">' + ranks.Enlisted[i].abbreviation + '</div>\n\
                        </li>';//<div class="becomerank">' + ranks.Enlisted[i].BecomeRank + '</div>\n\
        }
    }
    rOutput += '</ul><h2>Commissioned Officers</h2><ul>';
    for (var i = 0; i < ranks.CommissionedOfficers.length; i++) {
        if (ranks.CommissionedOfficers[i].inUse === "true" || !rankfilter) {
            rOutput += '<li><img class="Insignia" alt="Insignia" src="img/' + ranks.CommissionedOfficers[i].insignia + '"/>\n\
                            <div class="title">' + ranks.CommissionedOfficers[i].title + '</div>\n\
                            <div class="abbreviation">' + ranks.CommissionedOfficers[i].abbreviation + '</div>\n\
                        </li>';//<div class="becomerank">' + ranks.CommissionedOfficers[i].BecomeRank + '</div>\n\
        }
    }
    rOutput += '</ul><h2>Warrant Officers</h2><ul>';
    var empty = true;
    for (var i = 0; i < ranks.WarrantOfficers.length; i++) {
        if (ranks.WarrantOfficers[i].inUse === "true" || !rankfilter) {
            rOutput += '<li><img class="Insignia" alt="Insignia" src="img/' + ranks.WarrantOfficers[i].insignia + '"/>\n\
                            <div class="title">' + ranks.WarrantOfficers[i].title + '</div>\n\
                            <div class="abbreviation">' + ranks.WarrantOfficers[i].abbreviation + '</div>\n\
                        </li>';//<div class="becomerank">' + ranks.WarrantOfficers[i].BecomeRank + '</div>\n\
            empty = false;
        }
    }
    if (empty) {
        rOutput += '<li>There are no Warrant Officers at the moment</li>';
    }
    rOutput += '</ul></div>';
    return rOutput;
}

function drawReserved(res) {
    output += '<div class="res"><h1>Reserved (' + res.length + ') </h1><ul>';
    for (var i = 0; i < res.length; i++) {
        player = getPlayer(res[i]);
        output += '<li><div class="reserved">' + player.name + '\
                      ' + drawPlayerExtraInfo(player, 2) + '\
                    <div></li>';
    }
    output += '</ul></div>';
}

function drawRoles() {
    var rOutput = '<div class="roles"><h1>Roles</h1><ul>';
    for (var i = 0; i < roles.length; i++) {
        rOutput += '<li><img class="role" alt="role" src="img/' + roles[i].icon + '" title="' + roles[i].role + '"/><p>' + roles[i].role + '</p></li>';
    }
    rOutput += '</ul></div>';
    return rOutput;
}

function drawBadgesList() {
    var rOutput = '<div><h1>Badges</h1>';
    var counter = 0;
    for (var i = 0; i < 10 && counter < badges.length; i++) {
        rOutput += '<h2>Type ' + i + '</h2>';
        for (var j = 0; j < badges.length; j++) {
            if (parseInt(badges[j].type) === i) {
                rOutput += drawBadges([badges[j]]);
                counter++;
            }
        }
    }
    rOutput += '</div>';
    return rOutput;
}

function drawBadgesGenInfo() {
    var rOutput = '<div class="badgesInfo"><h1>Info about the badges</h1>';
    rOutput += '<h2>General</h2>';
    rOutput += '<p>Badges are there for the COs and NCOs to check everyonce progress. Badges are also there to make sure that all privates and recruits do there training. The Badges will also be used to check for promotions for people.</p>';
    rOutput += '<h2>Basic Badges</h2>';
    rOutput += '<p>There are a few basic badges. Basic badges are all type 0. These badges will be assigned to you if you have done the training for that badges. You need to have all of these badges to be promoted to private.</p>';
    rOutput += '<p>Eg.:' + drawBadge("Formations") + '</p>';
    rOutput += '<h2>Advanced Training Badges</h2>';
    rOutput += '<p>Advanced Training Badges are all type 0. These badges will be assigned to you if you have done the training for that badges and your trainer thinks that you know it verry well.</p>';
    rOutput += '<p>Eg.:' + drawBadge("Breaching") + '</p>';
    rOutput += '<h3>Role Badges</h3>';
    rOutput += '<p>These badges are part of the advanced training badges but are specifically for your role.</p>';
    rOutput += '<p>Eg.:' + drawBadge("Marksman") + '</p>';
    rOutput += '<h2>Types of Badges</h2>';
    rOutput += '<p>As you might have noticed there are different types (and colors) badges. Types range from 0 to 4 from common to rare respectively. Colors are dependent on the type.</p>';
    rOutput += '<h2>Collection Badges</h2>';
    rOutput += '<p>Collection Badges will not be awarded. These badges will be awarded to you by the system. If you have certain badges the system will check and give you the collection badge. Collection badges are usually of an higher type then the badges you neded.</p>';
    rOutput += '<p>Eg.:' + drawBadge("BCT") + drawBadge("Specialist") + drawBadge("Expert") + '</p>';
    rOutput += '<h2>Assignment</h2>';
    rOutput += '<p>Badges will be assigned to people after trainings and OPs. Badges can only be assigned during offical OPs and trainings. You will not get badges during playing on the public server (if not mentioned otherwise).</p>';
    rOutput += '<h2>Method of drawing on the roster</h2>';
    rOutput += '<p>If you do not have any badges the list of badges will just be empty.</br>If you have badges, all the badges that you have will be displayed. Except if you have a Collection Badge. The badges that are in a collection badge will be filtered out.</p>';
    rOutput += '<h2>Permanent</h2>';
    rOutput += '<p>The badges that you have been awarded to you will not been taken away. Only in extreme or special cases badges can be revoked.</p>';
    rOutput += '<h2>Officers badge</h2>';
    rOutput += '<p>Eg.:' + drawBadge("Officer") + '</p>';
    rOutput += '<p>This badge will only be awarde to COs.</p>';
    rOutput += '</div>';
    return rOutput;
}

function drawBadgesInfo() {
    var rOutput = '<div class="badgesInfo"><h1>Info about the badges</h1>';
    var counter = 0;
    for (var i = 0; i < 10 && counter < badges.length; i++) {
        rOutput += '<h2>Type ' + i + '</h2>';
        for (var j = 0; j < badges.length; j++) {
            if (parseInt(badges[j].type) === i) {
                rOutput += drawBadges([badges[j]]) + "<p>" + parseBadgeMaker(badges[j].discription) + "</p>";
                counter++;
            }
        }
    }
    rOutput += '</div>';
    return rOutput;
}

function parseBadgeMaker(text) {
    var origText = text;
    for (var j = 0; j < badges.length; j++) {
        text = text.split('"' + badges[j].id + '"').join(drawBadge(badges[j].id));//replaceAll
    }
    if (text !== origText) {
        text = text.replace(/{/g, "<div class=\"borderFrame\">");
        text = text.replace(/}/g, "</div>");
    }
    return text;
}

function escapeQuotes(string) {
    string = string.replace(/{/g, "(");
    string = string.replace(/}/g, ")");
    return string.replace(/\"/g, "'");
}

function updateLoader() {
    document.getElementById("orbatRoot").innerHTML = "<h2>Loading<img src=\"img/loader.gif\" alt=\"Loading\"/></h2><p>Downloading: " + loaded + "/" + toLoad + "</p><p>Parsing: " + parsed + "/" + toparse + "</p><p>Status: " + loadingStatus + "</p>";
}

//---------------------------------------
//----------------Parse------------------
//---------------------------------------

function logicToText(badgeLogic) {

}

function parseRanks(rankInfo) {
    for (var i = 0; i < rankInfo.Enlisted.length; i++) {
        ranksList.push(rankInfo.Enlisted[i]);
    }
    for (var i = 0; i < rankInfo.CommissionedOfficers.length; i++) {
        ranksList.push(rankInfo.CommissionedOfficers[i]);
    }
    for (var i = 0; i < rankInfo.WarrantOfficers.length; i++) {
        ranksList.push(rankInfo.WarrantOfficers[i]);
    }
}

function unitsize(size) {
    switch (size) {
        case "Regiment":
            return "III";
        case "Battalion":
            return "II";
        case "Company":
            return "I";
        case "Platoon":
            return "•••";
        case "Squad":
            return "••";
        case "Fireteam":
            return "Ø";
        default:
            return "";
    }
}

function getRoleInfo(role) {
    if (role === "") {
        return {"role": "", "icon": "Roles/rifleman.svg"};
    }
    for (var i = 0; i < roles.length; i++) {
        if (roles[i].role === role) {
            return roles[i];
        }
    }
    console.log("Error: role does not exist: " + role);
    return {"role": "", "icon": "Roles/rifleman.svg"};
}

function drawBadge(badge) {
    result = '<div class="badge type0 inline">badge not found</div>';
    for (var i = 0; i < badges.length; i++) {
        if (badges[i].id === badge) {
            result = '<div class="badge type' + badges[i].type + ' inline" title="' + escapeQuotes(badges[i].discription) + '">' + badges[i].name + '</div>';
            break;
        }
    }
    return result;
}

function getBadgesInfo(player) {
    var badgesInfo = [];
    for (var i = 0; i < badges.length; i++) {
        if (player.badges.indexOf(badges[i].id) >= 0) {
            badgesInfo.push(badges[i]);
        }
    }
    badgesInfo = getExtraBadges(player, badgesInfo);
    return badgesInfo;
}

function getExtraBadges(player, badgesdisplay) {
    var toRemove = [];
    for (var i = 0; i < badges.length; i++) {
        if (badges[i].requirements.length > 0) {
            if (hasBadgeRequirments(player, badges[i])) {
                badgesdisplay.push(badges[i]);
                toRemove = toRemove.concat(getRequirementList(badges[i].requirements));
            }
        }
    }
    for (var i = badgesdisplay.length - 1; i >= 0; i--) {
        if (toRemove.indexOf(badgesdisplay[i].id) >= 0) {
            badgesdisplay.splice(i, 1);
        }
    }

    return badgesdisplay;
}

function getRequirementList(requirements) {
    var toRemove = [];
    for (var i = 0; i < requirements.length; i++) {
        if (requirements[i] instanceof Array) {
            toRemove = toRemove.concat(getRequirementList(requirements[i]));
        } else {
            toRemove.push(requirements[i]);
        }
    }
    return toRemove;
}

function hasBadgeRequirments(player, badge) {
    for (var i = 0; i < badge.requirements.length; i++) {
        if (badge.requirements[i] instanceof Array) {
            //or
            if (!hasBadgeRequirmentsOR(player, badge.requirements[i])) {
                return false;
            }
        } else {
            //and
            if (player.badges.indexOf(badge.requirements[i]) < 0) {//not has badge
                return false;
            }
        }
    }
    return true;
}

function hasBadgeRequirmentsOR(player, requirements) {
    for (var i = 0; i < requirements.length; i++) {
        if (requirements[i] instanceof Array) {
            if (hasBadgeRequirmentsOR(player, requirements[i])) {
                return true;
            }
        } else {
            if (player.badges.indexOf(requirements[i]) >= 0) {//has badge
                return true;
            }
        }
    }
    return false;
}

function filterBadges(player) {
    /*var type = 0;
     for (var i = 0; i < player.badges.length; i++) {
     if (parseInt(player.badges[i].type) > type) {
     type = parseInt(player.badges[i].type);
     }
     }
     if (type > 0) {
     type--;
     }*/
    var badges = [];
    for (var i = 0; i < player.badges.length; i++) {
        //if (parseInt(player.badges[i].type) >= type) {
        badges.push(player.badges[i]);
        //}
    }
    return badges;
}


function getRankInfo(rank) {
    if (rank === "") {
        return {"title": "", "abbreviation": "", "insignia": "Ranks/USMC-E1.svg", "NATOCode": "", "BecomeRank": "", "inUse": ""};
    }
    for (var i = 0; i < ranksList.length; i++) {
        if (ranksList[i].title === rank) {
            return ranksList[i];
        }
    }
    console.log("Error: rank does not exist: " + rank);
    return {"title": "", "abbreviation": "", "insignia": "Ranks/USMC-E1.svg", "NATOCode": "", "BecomeRank": "", "inUse": ""};
}

function getPlayer(playerID) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].ID === playerID) {
            return players[i];
        }
    }
    if (playerID !== "") {
        console.log("Error: player does not exist.");
    }
    return emptyplayer;
}

function parsePlayers() {
    for (var i = 0; i < players.length; i++) {
        player = players[i];
        player.rank = getRankInfo(player.rank);
        player.role = getRoleInfo(player.role);
        player.badges = getBadgesInfo(player);
    }
    emptyplayer = {"ID": "OPEN",
        "name": "OPEN",
        "rank": "",
        "role": "",
        "UID": "",
        "remark": "",
        "joined": "",
        "lastOP": "",
        "country": "",
        "badges": []};
    emptyplayer.rank = getRankInfo(emptyplayer.rank);
    emptyplayer.role = getRoleInfo(emptyplayer.role);
}

function hasBadge(player, badgeName) {
    for (var i = 0; i < player.badges.length; i++) {
        if (player.badges[i].id === badgeName) {
            return true;
        }
    }
    for (var j = 0; j < badges.length; j++) {
        if (badges[j].requirements.length > 0) {
            if (getRequirementList(badges[j].requirements).indexOf(badgeName) >= 0) {
                for (var k = 0; k < player.badges.length; k++) {
                    if (player.badges[k].id === badges[j].id) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

function getWeeks(date) {
    var today = new Date(Date.now());
    var oneWeek = 24 * 60 * 60 * 1000 * 7; // hours*minutes*seconds*milliseconds
    return Math.floor(Math.abs((today.getTime() - date.getTime()) / (oneWeek)));
}

function getDays(date) {
    var today = new Date(Date.now());
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    return Math.floor(Math.abs((today.getTime() - date.getTime()) / (oneDay)));
}

function getDaysWeek(date) {
    var today = new Date(Date.now());
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    return Math.floor(Math.abs((today.getTime() - date.getTime()) / (oneDay))) % 7;
}

function drawLastOP(dateString, type) {
    diffWeeks = '<div class="date">no date</div>';
    if (dateString !== "") {
        weeks = getWeeks(new Date(dateString));
        diffWeeks = '<div class="date';
        if (type === 1) {
            if (weeks <= 3) {
                diffWeeks += ' green">';
            } else {
                diffWeeks += ' red">';
            }
        } else {
            diffWeeks += '">';
        }
        diffWeeks += weeks + " week(s)</div>";
    }
    return diffWeeks;
}

function drawPlayerExtraInfo(player, type) {
    if (player === emptyplayer) {
        return "";
    }
    switch (type) {
        case 1:
            return '<div class="extraInfo">\
                        <div class="playerImg"><img class="Insignia" alt="insignia" title="' + player.rank.title + '" src="img/' + player.rank.insignia + '"/><br/><img class="role" alt="role" src="img/' + player.role.icon + '" title="' + player.role.role + '"/></div>\
                        <div class="playerInfo"><div class="playerName">' + player.rank.abbreviation + player.name + '<img class="flag" src="img/Flags/'+ player.country +'.png" alt="Flag" /></div>\
                        <div><div class="label">Last OP:</div> ' + drawLastOP(player.lastOP, 1) + '</div>\
                        <div class="label">Badges:</div> <div class="badges">' + drawBadges(filterBadges(player)) + '</div></div>\
                      </div>';
        case 2:
            return '<div class="extraInfo">\
                        <div class="playerInfoFull"><div class="playerName">' + player.name + '</div>\
                        <div><div class="label">Last OP:</div> ' + drawLastOP(player.lastOP, 2) + '</div>\
                        <div class="label">Badges:</div> <div class="badges">' + drawBadges(filterBadges(player)) + '</div></div>\
                      </div>';
        case 3:
            return '<img class="Insignia" alt="insignia" title="' + player.rank.title + '" src="img/' + player.rank.insignia + '"/><div class="playerName">' + player.rank.abbreviation + player.name + '</div>\
                        <div><div class="label">Last OP:</div> ' + drawLastOP(player.lastOP, 2) + '</div>\
                        <div class="label">Badges:</div> <div class="badges">' + drawBadges(filterBadges(player)) + '</div>';
        default:
            return '<div class="extraInfo">\
                        <div class="playerImg"><img class="Insignia" alt="insignia" title="' + player.rank.title + '" src="img/' + player.rank.insignia + '"/><br/><img class="role" alt="role" src="img/' + player.role.icon + '" title="' + player.role.role + '"/></div>\
                        <div class="playerInfo"><div class="playerName">' + player.rank.abbreviation + player.name + '</div>\
                        <div><div class="label">Last OP:</div> ' + drawLastOP(player.lastOP, 1) + '</div>\
                        <div class="label">Badges:</div> <div class="badges">' + drawBadges(filterBadges(player)) + '</div></div>\
                      </div>';
    }
    return "";
}


//-----------widow-------------

function hideWindow() {
    addClass(document.getElementById("overlay"), "hide");
}

function openWindow() {
    removeClass(document.getElementById("overlay"), "hide");
}

function openWindow(inner) {
    document.getElementById("windowContent").innerHTML = inner;
    removeClass(document.getElementById("overlay"), "hide");
}

function addClass(element, classToAdd) {
    var currentClassValue = element.className;

    if (currentClassValue.indexOf(classToAdd) === -1) {
        if ((currentClassValue === null) || (currentClassValue === "")) {
            element.className = classToAdd;
        } else {
            element.className += " " + classToAdd;
        }
    }
}

function removeClass(element, classToRemove) {
    var currentClassValue = element.className;

    if (currentClassValue === classToRemove) {
        element.className = "";
        return;
    }

    var classValues = currentClassValue.split(" ");
    var filteredList = [];

    for (var i = 0; i < classValues.length; i++) {
        if (classToRemove !== classValues[i]) {
            filteredList.push(classValues[i]);
        }
    }

    element.className = filteredList.join(" ");
}


//-----------window type-----------

function showRoles() {
    openWindow(drawRoles());
}

function showRanks() {
    openWindow(drawRanks());
}

function showBadges() {
    openWindow(drawBadgesList());
}

function showBadgesGenInfo() {
    openWindow(drawBadgesGenInfo());
}

function showBadgesInfo() {
    openWindow(drawBadgesInfo());
}
