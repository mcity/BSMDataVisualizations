	var toggle = document.getElementById('outer-container'),
	    toggleContainer = document.getElementById('toggle-container'),
	    toggleNumber,
	    datasetChosen,
	    datasets = ["data/trip.csv","data/vehicle.csv"];


	toggle.addEventListener('click', function() {
		toggleNumber = !toggleNumber;
		if (toggleNumber) {
			toggleContainer.style.clipPath = 'inset(0 0 0 50%)';
			toggleContainer.style.backgroundColor = '#D74046';
			datasetChosen = datasets[1];
			heatmapChart(datasetChosen);
		} else {
			toggleContainer.style.clipPath = 'inset(0 50% 0 0)';
			toggleContainer.style.backgroundColor = 'dodgerblue';
			datasetChosen = datasets[0];
			heatmapChart(datasetChosen);
		}
	});