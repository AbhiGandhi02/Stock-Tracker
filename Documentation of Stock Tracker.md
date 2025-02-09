# Stock Tracker Documentation

## Overview
The Stock Tracker is a web-based application that allows users to track stock prices in real-time from different stock exchanges (NSE, NYSE, NASDAQ). It fetches stock data using APIs and displays key metrics such as current price, opening price, and percentage change. Users can search for stocks, receive symbol suggestions, and view a list of popular stocks dynamically.

## Technologies Used
- **HTML**: Structuring the UI
- **CSS**: Styling the webpage
- **JavaScript**: Handling API requests and DOM manipulation
- **APIs**:
  - [Finnhub API](https://finnhub.io/) for US stock market data
  - [Alpha Vantage API](https://www.alphavantage.co/) for NSE stock market data

## Features
1. **Stock Search**
   - Users can enter a stock symbol to fetch live stock data.
   - Provides symbol suggestions as users type.
   
2. **Exchange Selection**
   - Users can choose between NSE and NYSE/NASDAQ markets.
   
3. **Stock Data Display**
   - Displays stock name, current price, opening price, and percentage change.
   - Colors indicate price movement (green for positive, red for negative).
   
4. **Popular Stocks List**
   - Shows a list of trending stocks for the selected exchange.
   - Updates dynamically every 30 seconds.
   
## Project Structure
```
/stock-tracker
├── index.html       # Main HTML file
├── styles.css       # CSS file for styling
├── script.js        # JavaScript file for logic
```

## Setup and Usage
### 1. Clone the Repository
```sh
git clone https://github.com/your-repo/stock-tracker.git
cd stock-tracker
```

### 2. Open `index.html`
You can directly open `index.html` in a web browser to use the stock tracker.

### 3. API Configuration
- Obtain API keys from **Finnhub** and **Alpha Vantage**.
- Replace the placeholders in `script.js`:
  ```js
  const finnhubApiKey = 'YOUR_FINNHUB_API_KEY';
  const alphaVantageApiKey = 'YOUR_ALPHA_VANTAGE_API_KEY';
  ```

### 4. Running the Project
Simply open `index.html` in a web browser. Ensure an active internet connection to fetch stock data.

## Challenges and Limitations
- **Alpha Vantage API Rate Limit**: Free-tier users may face limitations in fetching NSE stock data.
- **Cross-Origin Issues**: Some APIs may require CORS setup for secure access.
- **Data Delay**: API data might have a small delay depending on the provider.

## Future Improvements
- Implement WebSockets for real-time updates.
- Add a backend to store user watchlists.
- Improve UI/UX with animations and charts.

## License
This project is open-source and available under the MIT License.

