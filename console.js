$(document).ready(function(){
	
	var g_adwindow; //pop up window of ad
	var g_adtimer; //timer to check for new tracker 
	var g_trackerlist = []; //stores all captured img.src
	var g_outputlist = []; //stores all printed message
	
	function adWindowclosed() {
		if (!g_adwindow) {
			return true;
		} 
		else {
			if (g_adwindow.closed) { 
				return true;
			} 
			else {
				alert('Ad simulation window already opened');
				return false;
			}
		}
	}
	
	function printOut(message, norepeat){ //print out message into tracker console
		if ($.inArray(message, g_outputlist) == -1){
			$("#ConsoleOutput").append('<div class="TrackerList" >' + 
				'<div class="TrackerCheck"><img src="images/check.png" /></div>' + 
				'<div class="TrackerText">' + message + '</div>' +
			'</div> ');
			$("#ConsoleOutput").scrollTop($("#ConsoleOutput")[0].scrollHeight);
			if (norepeat == true){
				g_outputlist.push(message);
			}
		}
	}
	
	function toTitleCase(str){
		return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	}
	
	function checkAndprint(url){ //Set the print out message base on url
		if (url.indexOf("/t?") > 0) {
			printOut("Ad Request Fired", true);
			return;
		}
		
		if (url.indexOf("ty=E") > 0){
			printOut("First Engagement Fired", true);
		}
				
		if (url.indexOf("tt=CTR") > 0){
			printOut("First Clickthrough Fired", true);
		}
		
		var type = /type=([^&]+)/.exec(url);
		if (type != null){
			if  (type[1] == 'fallback_static_image' || type[1].indexOf('page_view') > 0){
				printOut("Ad Impression Fired", true);
				return;
			}		
					
			switch (type[1]) {
				case 'measurable':
					printOut("Viewability Is Measurable", true);
					break;					
				case 'in_view':
					printOut("Ad Is Viewable", true);
					break;
				case 'expand_banner':
					printOut("Ad Is Expanded", true);
					break;	
				case 'tab_click':				
					printOut("Tab " + /tabId=([^&]+)/.exec(url)[1] + " Is Clicked", true);
					break;
				default: 
					var msg = type[1].replace(/_/g, ' ');
					printOut(toTitleCase(msg) + " Fired", true);																								
			}			
			return;
		}
		
		printOut("External Tracker Fired (" + url + ")", true);
		
	}
	
	function outputTracker(trackedimg){ //Check if trackedimg is 1x1 image before printing out
		var tplength = trackedimg.length;
		if (tplength > 0){
			for (var i = 0; i < tplength; i++){
				if (trackedimg[i].complete){
					if (trackedimg[i].width <= 1 && trackedimg[i].height <= 1){
						if ($.inArray(trackedimg[i].src,g_trackerlist) == -1){
							g_trackerlist.push(trackedimg[i].src);
							checkAndprint(trackedimg[i].src);
						}
					}
				}
			}
		}
	}	
	
	function simulateAd(adtag){
		if ((adtag != "") && adWindowclosed()) {
 			$( "#ConsoleOutput" ).empty();
			g_adwindow = window.open('', '', 'width=328,height=488,top=128,left=80');
			var doc = g_adwindow.document;
			doc.open();
			doc.write('<div style="display:none;">&nbsp</div>' + adtag);
         	doc.title = "Ad Simulation";
			var meta = document.createElement('meta');
			meta.setAttribute('name', 'viewport');
			meta.setAttribute('content', 'width=device-width, initial-scale=1');
			doc.head.appendChild(meta);
			doc.close();
			// console.log(meta)
			function DetectImg(){
				if (!g_adwindow.closed){
					var adimages = doc.images;
					var ifr = $(doc).contents().find( "iframe" );
				
					if (adimages.length > 0){
						outputTracker(adimages);
					}
					
					if (ifr.length > 0){
						for (var l = 0; l < ifr.length; l++){
							var ifrdoc = doc.getElementById(ifr[l].id).contentWindow.document;
							var ifrimages = ifrdoc.images ;
							if (ifrimages.length > 0){
								outputTracker(ifrimages);
							}	
						}
					}
					
				}
				else{
					g_trackerlist = [];
					g_outputlist = [];
					clearInterval(g_adtimer);	
				}						
			}
			g_adtimer = setInterval(DetectImg,200);
		}
		else{
			if(adtag == ""){
				alert("Please insert ad tag.");
			}
		}
	}
	
	$("#Render").click(function(){
		var adtag = $("#AdTag").val();	
		var cadtag = adtag.replace(/www.cdn.serving1.net/g, "track.richmediaads.com");
		cadtag = cadtag.replace(/cdn.serving1.net/g, "cdn.richmediaads.com");
		simulateAd(cadtag);		
	});

	$("#clearAdTag").click(function(){
		$("#AdTag").val('');
	});
	
	$("#Clear").click(function(){
		 $( "#ConsoleOutput" ).empty();
	});	
	
});