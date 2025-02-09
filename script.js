const FINNHUB_API_KEY = "cugepopr01qr6jncke10cugepopr01qr6jncke1g";
const ALPHA_VANTAGE_API_KEY = "1TYHO46QYC4UJY2J";
const BASE_URL = "https://eodhd.com/api/real-time/";

let stockPortfolio = [];

// Function to fetch stock data
async function fetchStockData(symbol) {
    const exchange = exchangeSelect.value;

    try {
        // For BSE stocks
        if (exchange === "BSE") {
            const bseSymbol = `${symbol}.BSE`;
            
            // Fetch both overview and quote data from Alpha Vantage
            const [overviewResponse, quoteResponse] = await Promise.all([
                fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${bseSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`),
                fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${bseSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`)
            ]);

            const [overviewData, quoteData] = await Promise.all([
                overviewResponse.json(),
                quoteResponse.json()
            ]);

            console.log('Alpha Vantage Overview:', overviewData);
            console.log('Alpha Vantage Quote:', quoteData);

            if (quoteData['Global Quote']) {
                const quote = quoteData['Global Quote'];
                return {
                    symbol: symbol,
                    name: overviewData.Name || symbol,
                    currentPrice: parseFloat(quote['05. price']),
                    morningPrice: parseFloat(quote['02. open']),
                    changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                    isPositive: parseFloat(quote['09. change']) >= 0,
                    currency: '₹'
                };
            }
            return null;
        } 
        // For US markets, use existing Finnhub implementation
        else {
            const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
            const data = await response.json();

            return {
                symbol,
                currentPrice: data.c.toFixed(2),
                morningPrice: data.o.toFixed(2),
                changePercent: ((data.c - data.o) / data.o * 100).toFixed(2),
                isPositive: data.c >= data.o,
                currency: '$'
            };
        }
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null;
    }
}

// Function to fetch symbol suggestions
async function fetchSymbolSuggestions(query) {
    const exchange = exchangeSelect.value;

    if (query.length < 2) {
        clearSuggestions();
        return;
    }

    try {
        if (exchange === "BSE") {
            // Use Alpha Vantage search for BSE stocks
            const response = await fetch(
                `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${ALPHA_VANTAGE_API_KEY}`
            );
            const data = await response.json();
            console.log('Search results:', data);

            if (data.bestMatches) {
                const bseStocks = data.bestMatches.filter(match => 
                    match['4. region'] === 'India' && 
                    match['1. symbol'].endsWith('.BSE')
                );
                
                displaySuggestions(bseStocks.map(stock => ({
                    symbol: stock['1. symbol'].replace('.BSE', ''),
                    description: stock['2. name']
                })));
            }
        } else {
            // Use Finnhub for US markets
            const formattedQuery = query.toUpperCase().trim();
            let url = `https://finnhub.io/api/v1/search?q=${formattedQuery}&token=${FINNHUB_API_KEY}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (data.result && data.result.length > 0) {
                displaySuggestions(data.result);
            } else {
                clearSuggestions();
            }
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
        const symbol = exchangeSelect.value === "BSE" ? item.symbol : item.symbol;
        
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

// Handle stock search
async function handleSearch(symbol) {
    clearSuggestions();
    stockList.innerHTML = "";

    const stockData = await fetchStockData(symbol);
    if (stockData) {
        const stockItem = document.createElement("li");
        stockItem.innerHTML = `
            <span class="stock-name">${stockData.symbol}${stockData.name ? ` - ${stockData.name}` : ''}</span>
            <span class="stock-price">${stockData.currency}${stockData.currentPrice}</span>
            <span class="morning-price">${stockData.currency}${stockData.morningPrice}</span>
            <span class="stock-change ${stockData.isPositive ? 'positive' : 'negative'}">
                ${stockData.isPositive ? '+' : ''}${stockData.changePercent}%
            </span>
        `;
        stockList.appendChild(stockItem);
    } else {
        stockList.innerHTML = `<li class="error-message">Stock data unavailable</li>`;
    }
}

// Keep existing event listeners and other functions the same
searchInput.addEventListener("input", () => fetchSymbolSuggestions(searchInput.value.trim()));

document.addEventListener("click", (event) => {
    if (!searchInput.contains(event.target) && !suggestionsBox.contains(event.target)) {
        clearSuggestions();
    }
});

// Function to add a stock with validation
async function addStock(symbol) {
    if (!symbol || typeof symbol !== 'string') {
        alert('Please enter a valid stock symbol');
        return;
    }
    
    symbol = symbol.toUpperCase().trim();
    
    // Add .BSE suffix if it looks like a BSE symbol (typically 5-6 characters)
    if (symbol.length <= 6 && !symbol.includes('.')) {
        symbol = `${symbol}.BSE`;
    }

    if (stockPortfolio.includes(symbol)) {
        alert('Stock already in portfolio');
        return;
    }

    const stockData = await fetchStockData(symbol);
    if (stockData) {
        stockPortfolio.push(symbol);
        localStorage.setItem('stockPortfolio', JSON.stringify(stockPortfolio));
        updateStockList();
    } else {
        alert('Invalid stock symbol or API error. Please try again.');
    }
}
