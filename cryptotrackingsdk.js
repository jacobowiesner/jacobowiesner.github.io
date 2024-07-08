// Function to fetch data from the Alpaca API
async function fetchData(symbol, start_date, end_date) {
    const timeframe = "1D"; // Define the timeframe for daily data

    // Construct the URL with parameters for Alpaca API endpoint
    const url = `https://data.alpaca.markets/v1beta3/crypto/us/bars?symbols=${encodeURIComponent(symbol)}&timeframe=${timeframe}&start=${start_date}&end=${end_date}&limit=1000&sort=asc`;

    const options = {
        method: 'GET', // HTTP GET request method
        headers: {
            accept: 'application/json' // Request content type
        }
    };

    try {
        // Fetch data from the API using fetch API
        const response = await fetch(url, options);
        const data = await response.json(); // Parse response JSON data
        const bars = data.bars[symbol]; // Extract bars data for the specified symbol

        // Map bars data to format required for charting
        const rows = bars.map(bar => ({
            Date: new Date(bar.t).toISOString().split('T')[0], // Convert timestamp to ISO date string (YYYY-MM-DD)
            Close: bar.c, // Closing price
            High: bar.h, // High price
            Low: bar.l, // Low price
            Open: bar.o // Opening price
        }));

        return rows; // Return formatted data rows
    } catch (err) {
        console.error('Error:', err); // Log any errors that occur during fetch or data processing
    }
}

// Function to extract a specific property from each object in an array
function unpack(rows, key) {
    // Use the map function to iterate over each object (row) in the rows array
    return rows.map(row => row[key]); // For each row, return the value of the specified key
}

// Function to plot the candlestick chart using Plotly.js
async function plotChart() {
    // Retrieve input values from HTML input elements
    const symbolInput = document.getElementById('cryptoSymbol').value.trim(); // Trimmed crypto symbol
    const startDateInput = document.getElementById('startDate').value; // Start date input
    const endDateInput = document.getElementById('endDate').value; // End date input

    // Validate input values
    if (!symbolInput) {
        alert("Please enter a crypto symbol"); // Alert if symbol is not entered
        return;
    }

    if (!startDateInput || !endDateInput) {
        alert("Please enter both start and end dates"); // Alert if start or end date is missing
        return;
    }

    // Fetch data for the specified symbol and date range
    const rows = await fetchData(symbolInput, startDateInput, endDateInput);

    // Handle case where no data is returned
    if (!rows || rows.length === 0) {
        alert("No data found for the specified symbol."); // Alert if no data is found
        return;
    }

    // Configure trace for Plotly candlestick chart
    const trace = {
        x: unpack(rows, 'Date'), // X-axis data (dates)
        close: unpack(rows, 'Close'), // Close prices
        high: unpack(rows, 'High'), // High prices
        low: unpack(rows, 'Low'), // Low prices
        open: unpack(rows, 'Open'), // Open prices

        // Customize candlestick colors
        increasing: { line: { color: 'green' } }, // Green for increasing candles
        decreasing: { line: { color: 'red' } }, // Red for decreasing candles

        type: 'candlestick', // Type of chart: candlestick
        xaxis: 'x', // X-axis label
        yaxis: 'y' // Y-axis label
    };

    const data = [trace]; // Array containing trace data

    // Configure layout for Plotly candlestick chart
    const layout = {
        title: `${symbolInput} Candlestick Chart`, // Chart title with crypto symbol
        dragmode: 'zoom', // Enable zooming via drag
        showlegend: false, // Hide legend
        xaxis: {
            title: 'Date', // X-axis title
            rangeslider: { visible: false } // Disable range slider
        },
        yaxis: {
            title: 'Price' // Y-axis title
        }
    };

    // Create new Plotly candlestick chart in 'myDiv' element
    Plotly.newPlot('myDiv', data, layout);
}