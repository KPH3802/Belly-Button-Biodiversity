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
      var degrees = 180 - (response.WFREQ * 20),
        radius = .5;
      var radians = degrees * Math.PI / 180;
      var x = radius * Math.cos(radians);
      var y = radius * Math.sin(radians);

      console.log('response :', response.WFREQ);
      console.log('degrees :', degrees);

      // Path: may have to change to create a better triangle
      var mainPath = 'M -.0 -0.05 L .0 0.05 L ',
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
        name: 'Washes',
        text: response.WFREQ,
        hoverinfo: 'text+name'
      },
      {
        values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
        rotation: 90,
        text: ['8-9', '7-8',
          '6-7', '5-6',
          '4-5', '3-4',
          '2-3', '1-2',
          '0-1', ''],
        textinfo: 'text',
        textposition: 'inside',
        marker: {
          colors: ['#193300', '#336600',
            '#4C9900', '#66CC00',
            '#80FF00', '#99FF33',
            '#B2FF66', '#CCFF99',
            '#CCFFCC', '#FFFFFF']
        },
        labels: ['8-9', '7-8', '6-7', '5-6',
          '4-5', '3-4', '2-3', '1-2', '0-1', ''],
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
        height: 600,
        width: 600,
        xaxis: {
          zeroline: false,
          showticklabels: false,
          showgrid: false,
          range: [-1, 1]
        },
        yaxis: {
          zeroline: false,
          showticklabels: false,
          showgrid: false,
          range: [-1, 1]
        }
      };

      Plotly.newPlot('gauge', data, layout);

    });

}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  var sample_endpoint = '/samples/' + sample;
  d3.json(sample_endpoint)
    .then(function (response) {
      // @TODO: Build a Bubble Chart using the sample data
      console.log('[buildCharts] response:', response);
      // Grab our 3 lists of information separately
      var otu_labels = response.otu_labels;
      var otu_ids = response.otu_ids;
      var sample_values = response.sample_values;

      // Create a 'payload' to feed to the chart function
      var bubbleChartData =
      {
        'x': otu_ids,
        'y': sample_values,
        hovertext: otu_labels,
        'mode': 'markers',
        'marker': {
          size: sample_values,
          color: otu_ids
        }
      };

      // Create a data variable for trace
      var Bubbledata = [bubbleChartData];

      // Create a layout for the bubble chart
      var bubbleChartLayout = {
        autosize: true,
        xaxis: {
          'title': 'OTU IDS',
          // range: [-9, 3500],

          // automargin: true
        },
        // yaxis: {
        //   range: [0, 249],
        //   zeroline: false,
        //   // automargin: true
        // }
      };

      // build the bubble chart
      Plotly.newPlot('bubble', Bubbledata, bubbleChartLayout);

      // @TODO: Build a Pie Chart
      // HINT: You will need to use slice() to grab the top 10 sample_values,
      // otu_ids, and labels (10 each).

      var PieChartData = {
        values: sample_values.slice(0, 10),
        labels: otu_ids.slice(0, 10),
        'hovertext': otu_labels.slice(0, 10),
        type: 'pie'
      };

      var PieData = [PieChartData];

      var pielayout = {
        height: 500,
        width: 600
      };

      Plotly.newPlot("pie", PieData, pielayout);

    });
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
