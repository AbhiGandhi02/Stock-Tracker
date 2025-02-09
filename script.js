const finnhubApiKey = 'cugepopr01qr6jncke10cugepopr01qr6jncke1g';
const alphaVantageApiKey = '1TYHO46QYC4UJY2J';
const searchInput = document.getElementById("stock-search");
const stockList = document.querySelector(".stock-list");
const exchangeSelect = document.getElementById("exchange-select");

// Ensure dropdown only has NYSE
exchangeSelect.innerHTML = `<option value="NYSE">NYSE</option>`;

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

    const formattedQuery = query.toUpperCase().trim();
    const url = `https://finnhub.io/api/v1/search?q=${formattedQuery}&token=${finnhubApiKey}`;

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
        const symbol = item.symbol;
        const description = item.description;

        const suggestionItem = document.createElement("li");
        suggestionItem.textContent = `${symbol} - ${description}`;
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

// Fetch stock data
async function fetchStockData(symbol) {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        return {
            symbol,
            currentPrice: data.c?.toFixed(2),
            morningPrice: data.o?.toFixed(2),
            changePercent: ((data.c - data.o) / data.o * 100).toFixed(2),
            isPositive: data.c >= data.o
        };
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
