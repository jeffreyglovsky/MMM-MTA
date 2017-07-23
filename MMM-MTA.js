/* global Module */

/* Magic Mirror
 * Module: MMM-MTA
 *
 * By Nicholas Konecny
 * MIT Licensed.
 */

Module.register("MMM-MTA",{

	start: function() {
		this.linesData = [];
		this.lastUpdated = "Loading...";
		this.getStatus(this);		
	},

	getStyles: function() {
		return ["MTA.css"];
	},

	getStatus: function (self) {
		self.sendSocketNotification('GET_MTA_STATUS', self.config);		
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = "mta";

		var table = document.createElement("table");		
		var delaysText = "";

		this.linesData.map(line => {
			var row = document.createElement("tr");
			table.appendChild(row);

			if (line.status[0] === "DELAYS") {
				row.className = "animate-flicker";				
				row.style = "color: red";

				var sanatizedText = this.stripHTML(line.text[0]);
				delaysText += sanatizedText.replace(/\[(.*?)\]/g, this.createLineCircle(line, "$1").outerHTML);					
			}	

			var circles = document.createElement("div");
			line.name[0].split("").map(lineName => {				
				circles.appendChild(this.createLineCircle(line, lineName));
			});
			
			var col1 = document.createElement("td");		
			var col2 = document.createElement("td");

			col1.style = "float:left;";
			col1.appendChild(circles);
			col2.style = "float:right;";
			col2.innerHTML = line.status;


			row.appendChild(col1);
			row.appendChild(col2);					
		});
		wrapper.appendChild(table);



		var lastUpdated = document.createElement("div");			
		lastUpdated.className = "updated-text";
		lastUpdated.innerHTML = "Last updated: " + this.lastUpdated;
	    wrapper.appendChild(lastUpdated);			
	

		if (delaysText) {
			// Divider
			wrapper.appendChild(document.createElement("hr"));

			var marquee = document.createElement("marquee");
			marquee.className = "marquee";
			
			var att = document.createAttribute("scrollamount");
		    att.value = "20";
		    marquee.setAttributeNode(att);

			marquee.innerHTML = delaysText;
			wrapper.appendChild(marquee);
		}
		
		
		return wrapper;
	},

	createLineCircle: function(line, lineName) {
		var circle = document.createElement("div");
		circle.className = "circle";
		circle.innerHTML = lineName;
	
		if (line && line.status[0] === "DELAYS") {
			circle.style = "background-color: " + line.color + "; color:white;"
		}

		return circle;
	},

	stripHTML: function(html) {
	   var tmp = document.createElement("div");
	   tmp.innerHTML = html;
	   return tmp.textContent || tmp.innerText || "";
	},

	socketNotificationReceived: function (notification, payload) {
		Log.info(notification);
		if (notification === 'LINE_DATA') {
			this.linesData = payload.data;
			this.lastUpdated = payload.updated;
			this.updateDom(50);
		}
	}
});
