async function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  // Use d3 to select the panel with id of `#sample-metadata`
  const url = `/metadata/${sample}`
  const sample_metadata = await d3.json(url)
  const selection = d3.select("#sample-metadata")

  // testing logging to make sure data was correct
  // console.log(sample_metadata)

  // Use `.html("") to clear any existing metadata
  selection.html("")

  // Use `Object.entries` to add each key and value pair to the panel
  // Hint: Inside the loop, you will need to use d3 to append new
  // tags for each key-value in the metadata.
  Object.entries(sample_metadata).forEach(function ([key, value]) {
    const row = selection.append("tr")
    row.text(`${key}: ${value}`)
  })

  // BONUS: Build the Gauge Chart
  // buildGauge(data.WFREQ);
  const washingData = sample_metadata.WFREQ

  // testing logging to make sure the washing frequency was correct
  // console.log(washingData)

  // Level of the bar wll be the numnber of washes * 20 to move the lever in the correct location
  const level = washingData * 20

  // Trig to calc meter point (stole from Plotly documentation)
  const degrees = 180 - level
  const radius = .5
  const radians = degrees * Math.PI / 180
  const x = radius * Math.cos(radians)
  const y = radius * Math.sin(radians)

  // Path: not 100% sure on this and messing with it still
  const mainPath = 'M -.0 -0.025 L .0 0.025 L '
  const pathX = String(x)
  const space = " "
  const pathY = String(y)
  const pathEnd = " Z"
  const path = mainPath.concat(pathX, space, pathY, pathEnd)

  const gaugeData = [{
      type: 'scatter',
      x: [0],
      y: [0],
      marker: {
        size: 28,
        color: '850000'
      },
      showlegend: false,
      name: 'Frequency',
      text: level,
      hoverinfo: 'text+name'
    },
    {
      values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
      rotation: 90,
      text: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1", ""],
      textinfo: 'text',
      textposition: 'inside',
      marker: {
        colors: ['rgba(0, 100, 0, .5)', 'rgba(0, 128, 0, .5)',
          'rgba(46, 139, 87, .5)', 'rgba(107, 142, 35, .5)',
          'rgba(50, 205, 50, .5)', 'rgba(154, 205, 50 .5)',
          'rgba(144, 238, 144, .5)', 'rgba(210, 206, 145, .5)',
          'rgba(232, 226, 202, .5)', 'rgba(255, 255, 255, 0)'
        ]
      },
      labels: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1", ""],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }
  ]
  const gaugeLayout = {
    shapes: [{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }],
    title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
    height: 550,
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

  Plotly.newPlot('gauge', gaugeData, gaugeLayout);
}

async function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  const url = `/samples/${sample}`
  const bellyButton = await d3.json(url)

  // @TODO: Build a Bubble Chart using the sample data

  const bubbleX = bellyButton.otu_ids
  const bubbleY = bellyButton.sample_values
  const bubbleMarkers = bellyButton.sample_values
  const bubbleColors = bellyButton.otu_ids
  const bubbleText = bellyButton.otu_labels

  const bubbleTrace = {
    x: bubbleX,
    y: bubbleY,
    mode: 'markers',
    marker: {
      size: bubbleMarkers,
      color: bubbleColors
    },
    text: bubbleText
  }

  const bubbleData = [bubbleTrace]

  var bubbleLayout = {
    title: 'Belly Button Per Sample Bubble Chart',
    showlegend: true,
    xaxis: {
      title: "OTU IDs"
    },
    yaxis: {
      title: "Values"
    }
  };

  Plotly.newPlot("bubble", bubbleData, bubbleLayout)

  // @TODO: Build a Pie Chart
  // HINT: You will need to use slice() to grab the top 10 sample_values,
  // otu_ids, and labels (10 each).
  const pieIds = bellyButton.otu_ids.slice(0, 10)
  const pieLabels = bellyButton.otu_labels.slice(0, 10)
  const pieValues = bellyButton.sample_values.slice(0, 10)

  const pieData = [{
    values: pieValues,
    labels: pieIds,
    type: "pie",
    hovertext: pieLabels
  }]

  const pieLayout = {
    title: "Belly Button Per Sample Pie Chart"
  }

  Plotly.newPlot("pie", pieData, pieLayout)

  // Testing loging to make sure data is correct
  // console.log(pieValues)
  // console.log(pieLabels)
  // console.log(pieIds)
}

function init() {
  // Grab a reference to the dropdown select element
  const selector = d3.select("#selDataset");

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