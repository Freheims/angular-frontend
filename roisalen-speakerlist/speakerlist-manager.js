var timer;
var nonRegistered = 1;

function setupListeners() {
	$("form").submit(handleSpeakerSubmit);
	$(".delete-link").click(removeSpeaker);
	$("#subject").keypress(publishSubject)
}

function generateTableRowFromSpeaker(speaker) {
	var tableRow = "<tr class='entry'>";
	tableRow += "<td class='number'>"+speaker.number+"</td>";
	tableRow += "<td class='name'>"+speaker.name;
	tableRow += "</td><td class='delete-link'>X</td></tr>";
	
	tableRow += generateTableRowsForReplies(speaker.replies);
	$("#speakerList").find('tbody').append(tableRow);
}

function generateTableRowsForReplies(replies) {
	var tableRows = "";
	if (replies.length > 0) {
		replies.forEach(function(entry) {
			tableRows += "<tr class='reply'><td class='reply-arrow'>&#8627;</td><td class='replies'>" 
			tableRows += entry.number+" "+entry.name+"</td>";
			tableRows += "<td class='delete-link'>X</td></tr>";
		});
	}

	return tableRows;
}

function parseSpeakerQueue(data) {
	$("#speakerList tr").remove();
	data.forEach(generateTableRowFromSpeaker);
	$(".delete-link").click(removeSpeaker);
	$("#speakerNumber").val("");
}

function removeSpeaker(ev, index) {
	var index;
	if(index === undefined) {
		index = $(this).parent().index(".entry");
	}

	if(index === -1) {
		index = $(this).parent().index(".reply");
		$.ajax({
			url: SERVER_URL + "/speakerList/0/replies/" + index,
			type: "DELETE",
			success: getSpeakerList
		});
	} else {
		$.ajax({
		url: SERVER_URL + "/speakerList/" + index,
		type: "DELETE",
		success: getSpeakerList
	});

	}
	
}

function getSpeakerList(response) {
	$.get(SERVER_URL + "/speakerList", parseSpeakerQueue);
}

function handleSpeakerSubmit(ev) {
	ev.preventDefault();
	var input = $("#speakerNumber").val();

	if (!input) {
		removeSpeaker(null, 0);
		timer.reset();
		timer.start();
	} else if (input.charAt(0) === "r") {
		addReplyToFirstSpeaker(input.slice(1));
		
	} else if (!isNaN(parseInt(input))) {
		timer.start();
		addSpeakerToBottom(input);
	} else {
		timer.start();
		registerUnknownSpeakerAndAddSpeakerToBottom(input);
	}
}

function addReplyToFirstSpeaker(replicantId) {
	$.post(SERVER_URL + "/speakerList/0/replies", replicantId, getSpeakerList, "json");
}

function addSpeakerToBottom(speakerId) {
	$.post(SERVER_URL + "/speakerList", speakerId, parseSpeakerQueue, "json");
}

function registerUnknownSpeakerAndAddSpeakerToBottom(name) {
	$.post(SERVER_URL + "/speakers", 
		JSON.stringify({number: "?" + nonRegistered.toString(), 
			name: name, 
			group: "?", 
			sex: "?" }), 
		function() {
			$.post(SERVER_URL + "/speakerList", "?" + nonRegistered.toString(), parseSpeakerQueue, "json");
			nonRegistered += 1;
		});
}

function publishSubject(ev) {
	if (ev.which==13) {
		$.post(SERVER_URL + "/subject", $("#subject").val());
	}
}

$(document).ready(function () {
	setupListeners();
	timer = new Stopwatch(document.getElementById("stopwatch"), {delay: 1000});
	$.get(SERVER_URL + "/speakerList", parseSpeakerQueue);
});