function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  // Use d3 to select the panel with id of `#sample-metadata`
  var sample_endpoint = '/metadata/' + sample;
  d3.json(sample_endpoint)
    .then(function (response) {
      // console.log('response:', response);
      // We do stuff with the data the comes back from the API
      // Target the METADATA element so that we can populate it with the gathered info
      var metaDataElement = d3.select('#sample-metadata');

      // Use `.html("") to clear any existing metadata
      metaDataElement.html("");

      // Use `Object.entries` to add each key and value pair to the panel
      // Hint: Inside the loop, you will need to use d3 to append new
      // tags for each key-value in the metadata.
      // console.log('Object entries:', Object.entries(response));
      Object.entries(response).forEach(function ([key, value]) {
        var text = key + ': ' + value;
        metaDataElement.append('p').text(text);
      })

      // BONUS: Build the Gauge Chart, uncomment when ready to test
      // buildGauge(response.WFREQ);

      // Trig to calc meter point
      var degrees = 180 - level,
        radius = .5;
      var radians = degrees * Math.PI / 180;
      var x = radius * Math.cos(radians);
      var y = radius * Math.sin(radians);

      // Path: may have to change to create a better triangle
      var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
      var path = mainPath.concat(pathX, space, pathY, pathEnd);

      var data = [{
        type: 'scatter',
        x: [0], y: [0],
        marker: { size: 28, color: '850000' },
        showlegend: false,
        name: 'speed',
        text: level,
        // hoverinfo: 'text+name'
      },
      {
        values: [50 / 6, 50 / 6, 50 / 6, 50 / 6, 50 / 6, 50 / 6, 50],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6',
          '4-5', '3-4', '2-3', '1-2','0-1',''],
        textinfo: 'text',
        textposition: 'inside',
        marker: {
          colors: ['rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
            'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
            'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
            'rgba(255, 255, 255, 0)']
        },
        labels: ['151-180', '121-150', '91-120', '61-90', '31-60', '0-30', ''],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
      }];

      var layout = {
        shapes: [{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
        title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
        height: 1000,
        width: 1000,
        xaxis: {
          zeroline: false, showticklabels: false,
          showgrid: false, range: [-1, 1]
        },
        yaxis: {
          zeroline: false, showticklabels: false,
          showgrid: false, range: [-1, 1]
        }
      };

      Plotly.newPlot('guage', data, layout);

    })

}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  var sample_endpoint = '/samples/' + sample;
  d3.json(sample_endpoint)
    .then(function (response) {
      // @TODO: Build a Bubble Chart using the sample data
      console.log('[buildCharts] response:', response);
      // Grab our 3 lists of information separately
      var labels = response['otu_labels'];
      var values = response['otu_ids'];
      var size = response['sample_values'];

      // Create a 'payload' to feed to the chart function
      var bubbleChartData =
      {
        'x': values,
        'y': size,
        'text': labels,
        'mode': 'markers',
        'marker': {
          size: size,
          color: values
        }
      };

      // Create a data variable for trace
      var Bubbledata = [bubbleChartData];

      // Create a layout for the bubble chart
      var bubbleChartLayout = {
        xaxis: { 'title': 'OTU IDS', range: [0, 3500] },
        yaxis: { range: [0, 200] }
      };

      // build the bubble chart
      Plotly.newPlot('bubble', Bubbledata, bubbleChartLayout);

      // @TODO: Build a Pie Chart
      // HINT: You will need to use slice() to grab the top 10 sample_values,
      // otu_ids, and labels (10 each).

      var PieChartData = {
        values: size.slice(0, 10),
        labels: values.slice(0, 10),
        type: 'pie',
        text: [labels]
      };

      var PieData = [PieChartData];

      var pielayout = {
        height: 400,
        width: 500
      };

      Plotly.newPlot("pie", PieData, pielayout);

    })
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
