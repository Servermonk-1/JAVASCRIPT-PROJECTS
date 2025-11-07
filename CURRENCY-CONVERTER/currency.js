class CurrencyConverter {
	constructor() {
		this.apiKey = 'https://v6.exchangerate-api.com/v6/00648850c6c42231ea47687f/latest/USD'; // Get free API key from exchangerate-api.com
		this.baseUrl = 'https://api.exchangerate-api.com/v4/latest/';
		this.cache = new Map();
		this.chart = null;

		this.initializeEventListeners();
		this.loadInitialData();
	}

	initializeEventListeners() {
		// Convert button
		document.getElementById('convert-btn').addEventListener('click', () => this.convert());

		// Swap button
		document.getElementById('swap-btn').addEventListener('click', () => this.swapCurrencies());

		// Input changes
		document.getElementById('amount').addEventListener('input', () => this.debouncedConvert());
		document.getElementById('from-currency').addEventListener('change', () => this.onCurrencyChange('from'));
		document.getElementById('to-currency').addEventListener('change', () => this.onCurrencyChange('to'));

		// Chart controls
		document.querySelectorAll('.chart-btn').forEach(btn => {
			btn.addEventListener('click', (e) => this.changeChartRange(e.target));
		});

		// Retry button
		document.getElementById('retry-btn').addEventListener('click', () => this.loadInitialData());

		// Popular currency clicks
		document.getElementById('popular-grid').addEventListener('click', (e) => {
			if (e.target.closest('.popular-item')) {
				this.handlePopularConversion(e.target.closest('.popular-item'));
			}
		});
	}

	async loadInitialData() {
		this.showLoading();

		try {
			await this.updateExchangeRates('USD');
			this.updatePopularConversions();
			this.hideLoading();
			this.convert();
		} catch (error) {
			this.showError();
			console.error('Error loading initial data:', error);
		}
	}

	async updateExchangeRates(baseCurrency) {
		const cacheKey = `rates_${baseCurrency}`;
		const cached = this.cache.get(cacheKey);

		if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
			return cached.data;
		}

		const response = await fetch(`${this.baseUrl}${baseCurrency}`);

		if (!response.ok) {
			throw new Error('Failed to fetch exchange rates');
		}

		const data = await response.json();

		// Cache the data
		this.cache.set(cacheKey, {
			data: data,
			timestamp: Date.now()
		});

		return data;
	}

	async convert() {
		const amount = parseFloat(document.getElementById('amount').value);
		const fromCurrency = document.getElementById('from-currency').value;
		const toCurrency = document.getElementById('to-currency').value;

		if (!amount || amount <= 0) {
			this.showResult(0, toCurrency);
			return;
		}

		this.showLoading();

		try {
			const ratesData = await this.updateExchangeRates(fromCurrency);
			const rate = ratesData.rates[toCurrency];
			const convertedAmount = amount * rate;

			this.showResult(convertedAmount, toCurrency);
			this.updateExchangeRateText(amount, rate, fromCurrency, toCurrency);
			this.updateLastUpdated();
			this.updateChart(fromCurrency, toCurrency);

		} catch (error) {
			this.showError();
			console.error('Conversion error:', error);
		}

		this.hideLoading();
	}

	showResult(amount, currency) {
		const formattedAmount = new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 6
		}).format(amount);

		document.getElementById('result-amount').textContent = formattedAmount;
		document.getElementById('result-currency').textContent = currency;
	}

	updateExchangeRateText(amount, rate, from, to) {
		const rateText = `${amount} ${from} = ${(amount * rate).toFixed(4)} ${to}`;
		document.getElementById('exchange-rate-text').textContent = rateText;
	}

	updateLastUpdated() {
		const now = new Date().toLocaleString();
		document.getElementById('last-updated').textContent = now;
	}

	swapCurrencies() {
		const fromSelect = document.getElementById('from-currency');
		const toSelect = document.getElementById('to-currency');

		const temp = fromSelect.value;
		fromSelect.value = toSelect.value;
		toSelect.value = temp;

		this.onCurrencyChange('from');
		this.onCurrencyChange('to');
		this.convert();
	}

	onCurrencyChange(type) {
		const currency = document.getElementById(`${type}-currency`).value;
		const flagElement = document.getElementById(`${type}-flag`);
		const symbolElement = type === 'from' ? document.getElementById('from-symbol') : null;

		// Update flag
		flagElement.textContent = this.getFlagEmoji(currency);

		// Update symbol for from currency
		if (symbolElement) {
			symbolElement.textContent = this.getCurrencySymbol(currency);
		}

		this.debouncedConvert();
	}

	getFlagEmoji(currency) {
		const flagMap = {
			'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'JPY': '🇯🇵',
			'CAD': '🇨🇦', 'AUD': '🇦🇺', 'CHF': '🇨🇭', 'CNY': '🇨🇳',
			'INR': '🇮🇳', 'SGD': '🇸🇬', 'NZD': '🇳🇿', 'KRW': '🇰🇷',
			'BRL': '🇧🇷', 'RUB': '🇷🇺', 'ZAR': '🇿🇦', 'MXN': '🇲🇽'
		};
		return flagMap[currency] || '🏳️';
	}

	getCurrencySymbol(currency) {
		const symbolMap = {
			'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥',
			'CAD': 'C$', 'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥',
			'INR': '₹', 'SGD': 'S$', 'NZD': 'NZ$', 'KRW': '₩',
			'BRL': 'R$', 'RUB': '₽', 'ZAR': 'R', 'MXN': '$'
		};
		return symbolMap[currency] || currency;
	}

	async updatePopularConversions() {
		const popularGrid = document.getElementById('popular-grid');
		const baseCurrency = document.getElementById('from-currency').value;

		try {
			const ratesData = await this.updateExchangeRates(baseCurrency);
			const popularPairs = [
				{ to: 'EUR', name: 'Euro' },
				{ to: 'GBP', name: 'British Pound' },
				{ to: 'JPY', name: 'Japanese Yen' },
				{ to: 'CAD', name: 'Canadian Dollar' },
				{ to: 'AUD', name: 'Australian Dollar' },
				{ to: 'INR', name: 'Indian Rupee' }
			];

			popularGrid.innerHTML = popularPairs.map(pair => {
				const rate = ratesData.rates[pair.to];
				return `
                    <div class="popular-item" data-to="${pair.to}">
                        <div class="popular-flag">${this.getFlagEmoji(pair.to)}</div>
                        <div class="popular-info">
                            <div class="popular-rate">${rate.toFixed(4)}</div>
                            <div class="popular-pair">${baseCurrency}/${pair.to}</div>
                        </div>
                    </div>
                `;
			}).join('');

		} catch (error) {
			console.error('Error updating popular conversions:', error);
		}
	}

	handlePopularConversion(item) {
		const toCurrency = item.dataset.to;
		document.getElementById('to-currency').value = toCurrency;
		this.onCurrencyChange('to');
		this.convert();
	}

	async updateChart(fromCurrency, toCurrency) {
		// This is a simplified chart implementation
		// In a real app, you'd fetch historical data from an API

		const ctx = document.getElementById('rate-chart').getContext('2d');

		if (this.chart) {
			this.chart.destroy();
		}

		// Mock data for demonstration
		const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
		const data = [1.0, 0.98, 1.02, 1.05, 1.03, 1.01].map(val => val * this.getRandomRate());

		this.chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [{
					label: `${fromCurrency} to ${toCurrency}`,
					data: data,
					borderColor: '#667eea',
					backgroundColor: 'rgba(102, 126, 234, 0.1)',
					borderWidth: 2,
					fill: true,
					tension: 0.4
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false
					}
				},
				scales: {
					y: {
						beginAtZero: false
					}
				}
			}
		});
	}

	changeChartRange(button) {
		document.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
		button.classList.add('active');

		// In a real implementation, you'd fetch historical data for the selected range
		this.updateChart(
			document.getElementById('from-currency').value,
			document.getElementById('to-currency').value
		);
	}

	getRandomRate() {
		return 0.8 + Math.random() * 0.4; // Random rate between 0.8 and 1.2
	}

	debouncedConvert() {
		clearTimeout(this.debounceTimer);
		this.debounceTimer = setTimeout(() => this.convert(), 500);
	}

	showLoading() {
		document.getElementById('loading').style.display = 'block';
		document.getElementById('error').style.display = 'none';
	}

	hideLoading() {
		document.getElementById('loading').style.display = 'none';
	}

	showError() {
		document.getElementById('error').style.display = 'block';
		document.getElementById('loading').style.display = 'none';
	}
}

// Initialize currency converter when page loads
document.addEventListener('DOMContentLoaded', () => {
	new CurrencyConverter();
});

// Back to dashboard function
function goBack() {
	window.location.href = '../index.html'; 
}


// Free API key source: https://www.exchangerate-api.com/
// Sign up for free and replace 'YOUR_API_KEY' with your actual API key