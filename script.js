const finnhubApiKey = 'cugepopr01qr6jncke10cugepopr01qr6jncke1g';
const alphaVantageApiKey = '1TYHO46QYC4UJY2J';
const searchInput = document.getElementById("stock-search");
const stockList = document.querySelector(".stock-list");
const exchangeSelect = document.getElementById("exchange-select");

// Create suggestions box dynamically
const suggestionsBox = document.createElement("div");
suggestionsBox.classList.add("suggestions-box");
document.querySelector(".search-box").appendChild(suggestionsBox);

// Fetch symbol suggestions
async function fetchSymbolSuggestions(query) {
    if (query.length < 2) {
        clearSuggestions();
        return;
    }

    const exchange = exchangeSelect.value;
    const formattedQuery = query.toUpperCase().trim();
    let url = `https://finnhub.io/api/v1/search?exchange=${exchange}&token=${finnhubApiKey}&q=${formattedQuery}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.result && data.result.length > 0) {
            displaySuggestions(data.result);
        } else {
            clearSuggestions();
        }
    } catch (error) {
        console.error("Error fetching symbol suggestions:", error);
        clearSuggestions();
    }
}

// Display search suggestions
function displaySuggestions(suggestions) {
    clearSuggestions();

    const suggestionsList = document.createElement("ul");
    suggestions.forEach((item) => {
        let symbol = item.symbol;

        // Ensure correct symbol format for NSE/BSE
        if (exchangeSelect.value === "NSE") {
            symbol = `${symbol}.BSE`; // Alpha Vantage uses `.BSE` for NSE stocks
        }

        const suggestionItem = document.createElement("li");
        suggestionItem.textContent = `${symbol} - ${item.description}`;
        suggestionItem.addEventListener("click", () => {
            searchInput.value = symbol;
            clearSuggestions();
            handleSearch(symbol);
        });

        suggestionsList.appendChild(suggestionItem);
    });

    suggestionsBox.appendChild(suggestionsList);
    suggestionsBox.style.display = "block";
}

// Clear suggestions
function clearSuggestions() {
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.display = "none";
}

// Fetch stock data (Fixed: Uses correct format for NSE/BSE)
async function fetchStockData(symbol) {
    let url;

    if (exchangeSelect.value === "NS" || exchangeSelect.value === "BSE") {
        // changestock symobol from abc.NS to abc.BSE
        console.log(symbol);
        symbol = symbol.replace(".NS", ".BSE");
        url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${alphaVantageApiKey}`;
    } else {
        url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (exchangeSelect.value === "NS" || exchangeSelect.value === "BSE") {
            // console.log(data);
            const timeSeries = data["Time Series (Daily)"];
            if (!timeSeries) {
                console.warn("Alpha Vantage response:", data);
                return null;
            }

            const latestDate = Object.keys(timeSeries)[0];
            const latestData = timeSeries[latestDate];

            return {
                symbol,
                currentPrice: parseFloat(latestData["4. close"]).toFixed(2),
                morningPrice: parseFloat(latestData["1. open"]).toFixed(2),
                changePercent: (((latestData["4. close"] - latestData["1. open"]) / latestData["1. open"]) * 100).toFixed(2),
                isPositive: latestData["4. close"] >= latestData["1. open"]
            };
        } else {
            return {
                symbol,
                currentPrice: data.c.toFixed(2),
                morningPrice: data.o.toFixed(2),
                changePercent: ((data.c - data.o) / data.o * 100).toFixed(2),
                isPositive: data.c >= data.o
            };
        }
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null;
    }
}

// Handle stock search
async function handleSearch(symbol) {
    clearSuggestions();
    stockList.innerHTML = "";

    const stockData = await fetchStockData(symbol);
    if (stockData) {
        const stockItem = document.createElement("li");
        stockItem.innerHTML = `
            <span class="stock-name">${stockData.symbol}</span>
            <span class="stock-price">$${stockData.currentPrice}</span>
            <span class="morning-price">$${stockData.morningPrice}</span>
            <span class="stock-change ${stockData.isPositive ? 'positive' : 'negative'}">
                ${stockData.isPositive ? '+' : '-'}${stockData.changePercent}%
            </span>
        `;
        stockList.appendChild(stockItem);
    } else {
        stockList.innerHTML = `<li class="error-message">Stock data unavailable</li>`;
    }
}

// Search input event
searchInput.addEventListener("input", () => fetchSymbolSuggestions(searchInput.value.trim()));

// Hide suggestions when clicking outside
document.addEventListener("click", (event) => {
    if (!searchInput.contains(event.target) && !suggestionsBox.contains(event.target)) {
        clearSuggestions();
    }
});

// Add popular stocks data
const popularStocks = {
    'NSE': ['TCS.BSE', 'RELIANCE.BSE', 'HDFCBANK.BSE', 'INFY.BSE', 'ICICIBANK.BSE'],
    'NYSE': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META']
};

async function loadPopularStocks() {
    stockList.innerHTML = '<li class="loading">Loading popular stocks...</li>';
    
    const exchange = exchangeSelect.value;
    const stocks = popularStocks[exchange === 'NS' ? 'NSE' : 'NYSE'];
    
    stockList.innerHTML = '';
    
    try {
        for (const symbol of stocks) {
            const stockData = await fetchStockData(symbol);
            if (stockData) {
                const stockItem = document.createElement("li");
                stockItem.innerHTML = `
                    <span class="stock-name">${stockData.symbol}</span>
                    <span class="stock-price">$${stockData.currentPrice}</span>
                    <span class="morning-price">$${stockData.morningPrice}</span>
                    <span class="stock-change ${stockData.isPositive ? 'positive' : 'negative'}">
                        ${stockData.isPositive ? '+' : '-'}${stockData.changePercent}%
                    </span>
                `;
                stockList.appendChild(stockItem);
            }
        }
    } catch (error) {
        console.error('Error loading stocks:', error);
        stockList.innerHTML = '<li class="error">Error loading stocks. Please try again later.</li>';
    }
}

// Add event listener for exchange selection change
exchangeSelect.addEventListener("change", loadPopularStocks);

// Load popular stocks when page loads and update every 30 seconds
document.addEventListener("DOMContentLoaded", () => {
    loadPopularStocks();
    setInterval(loadPopularStocks, 30000);
});
