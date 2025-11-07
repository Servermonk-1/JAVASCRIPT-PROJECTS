class QuotesGenerator {
	constructor() {
		this.quotes = [];
		this.favorites = JSON.parse(localStorage.getItem('favoriteQuotes')) || [];
		this.currentCategory = 'all';
		this.speechSynthesis = window.speechSynthesis;

		this.initializeEventListeners();
		this.loadQuotes();
		this.loadQuoteOfTheDay();
		this.updateFavoritesDisplay();
	}

	initializeEventListeners() {
		// New quote button
		document.getElementById('new-quote-btn').addEventListener('click', () => this.getRandomQuote());

		// Action buttons
		document.getElementById('copy-btn').addEventListener('click', () => this.copyQuote());
		document.getElementById('share-btn').addEventListener('click', () => this.openShareModal());
		document.getElementById('speak-btn').addEventListener('click', () => this.speakQuote());
		document.getElementById('favorite-btn').addEventListener('click', () => this.toggleFavorite());

		// Category filters
		document.querySelectorAll('.category-btn').forEach(btn => {
			btn.addEventListener('click', (e) => this.filterByCategory(e.target));
		});

		// Favorites
		document.getElementById('clear-favorites').addEventListener('click', () => this.clearFavorites());

		// Modal
		document.querySelector('.close-modal').addEventListener('click', () => this.closeShareModal());
		document.getElementById('copy-share-text').addEventListener('click', () => this.copyShareText());

		// Share options
		document.querySelectorAll('.share-option').forEach(option => {
			option.addEventListener('click', (e) => this.shareOnPlatform(e.target));
		});

		// Close modal on background click
		document.getElementById('share-modal').addEventListener('click', (e) => {
			if (e.target.id === 'share-modal') this.closeShareModal();
		});

		// Keyboard shortcuts
		document.addEventListener('keydown', (e) => {
			if (e.key === ' ' || e.key === 'ArrowRight') {
				e.preventDefault();
				this.getRandomQuote();
			}
		});
	}

	async loadQuotes() {
		this.showLoading();

		try {
			// Using multiple quote APIs for variety
			const responses = await Promise.allSettled([
				fetch('https://api.quotable.io/random'),
				fetch('https://quotes.rest/qod?category=inspire'),
				fetch('https://type.fit/api/quotes')
			]);

			let allQuotes = [];

			// Process Quotable API
			if (responses[0].status === 'fulfilled') {
				const data = await responses[0].value.json();
				allQuotes.push({
					text: data.content,
					author: data.author,
					category: data.tags[0] || 'inspirational'
				});
			}

			// Process Quotes REST API
			if (responses[1].status === 'fulfilled') {
				const data = await responses[1].value.json();
				if (data.contents && data.contents.quotes) {
					data.contents.quotes.forEach(quote => {
						allQuotes.push({
							text: quote.quote,
							author: quote.author,
							category: 'inspirational'
						});
					});
				}
			}

			// Process Type.fit API
			if (responses[2].status === 'fulfilled') {
				const data = await responses[2].value.json();
				data.slice(0, 50).forEach(quote => { // Limit to 50 quotes
					allQuotes.push({
						text: quote.text,
						author: quote.author || 'Unknown',
						category: 'wisdom'
					});
				});
			}

			// Add fallback quotes if APIs fail
			if (allQuotes.length === 0) {
				allQuotes = this.getFallbackQuotes();
			}

			this.quotes = allQuotes;
			this.getRandomQuote();
			this.hideLoading();

		} catch (error) {
			console.error('Error loading quotes:', error);
			this.quotes = this.getFallbackQuotes();
			this.getRandomQuote();
			this.hideLoading();
		}
	}

	getFallbackQuotes() {
		return [
			{
				text: "The only way to do great work is to love what you do.",
				author: "Steve Jobs",
				category: "motivational"
			},
			{
				text: "Innovation distinguishes between a leader and a follower.",
				author: "Steve Jobs",
				category: "success"
			},
			{
				text: "Your time is limited, so don't waste it living someone else's life.",
				author: "Steve Jobs",
				category: "life"
			},
			{
				text: "The future belongs to those who believe in the beauty of their dreams.",
				author: "Eleanor Roosevelt",
				category: "inspirational"
			},
			{
				text: "The way to get started is to quit talking and begin doing.",
				author: "Walt Disney",
				category: "success"
			},
			{
				text: "Life is what happens to you while you're busy making other plans.",
				author: "John Lennon",
				category: "life"
			},
			{
				text: "The only impossible journey is the one you never begin.",
				author: "Tony Robbins",
				category: "motivational"
			},
			{
				text: "In the end, it's not the years in your life that count. It's the life in your years.",
				author: "Abraham Lincoln",
				category: "wisdom"
			},
			{
				text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
				author: "Nelson Mandela",
				category: "inspirational"
			},
			{
				text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.",
				author: "Mother Teresa",
				category: "love"
			}
		];
	}

	getRandomQuote() {
		if (this.quotes.length === 0) return;

		let filteredQuotes = this.quotes;

		if (this.currentCategory !== 'all') {
			filteredQuotes = this.quotes.filter(quote =>
				quote.category.toLowerCase().includes(this.currentCategory.toLowerCase())
			);
		}

		if (filteredQuotes.length === 0) {
			filteredQuotes = this.quotes;
		}

		const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
		const quote = filteredQuotes[randomIndex];

		this.displayQuote(quote);
		this.updateFavoriteButton(quote);
	}

	displayQuote(quote) {
		document.getElementById('quote-text').textContent = quote.text;
		document.getElementById('quote-author').textContent = `— ${quote.author}`;
		document.getElementById('quote-category').innerHTML =
			`<span class="category-tag">${this.formatCategory(quote.category)}</span>`;

		// Add animation
		const quoteCard = document.querySelector('.quote-card');
		quoteCard.style.animation = 'none';
		setTimeout(() => {
			quoteCard.style.animation = 'fadeIn 0.5s ease';
		}, 10);
	}

	formatCategory(category) {
		return category.charAt(0).toUpperCase() + category.slice(1);
	}

	filterByCategory(button) {
		document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
		button.classList.add('active');

		this.currentCategory = button.dataset.category;
		this.getRandomQuote();
	}

	toggleFavorite() {
		const currentQuote = {
			text: document.getElementById('quote-text').textContent,
			author: document.getElementById('quote-author').textContent.replace('— ', ''),
			category: document.querySelector('.category-tag').textContent.toLowerCase()
		};

		const isAlreadyFavorite = this.favorites.some(fav =>
			fav.text === currentQuote.text && fav.author === currentQuote.author
		);

		if (isAlreadyFavorite) {
			this.removeFromFavorites(currentQuote);
		} else {
			this.addToFavorites(currentQuote);
		}
	}

	addToFavorites(quote) {
		this.favorites.push(quote);
		this.saveFavorites();
		this.updateFavoriteButton(quote, true);
		this.updateFavoritesDisplay();
		this.showToast('Quote added to favorites!');
	}

	removeFromFavorites(quote) {
		this.favorites = this.favorites.filter(fav =>
			!(fav.text === quote.text && fav.author === quote.author)
		);
		this.saveFavorites();
		this.updateFavoriteButton(quote, false);
		this.updateFavoritesDisplay();
		this.showToast('Quote removed from favorites!');
	}

	updateFavoriteButton(quote, isFavorite = null) {
		const favoriteBtn = document.getElementById('favorite-btn');
		const isCurrentlyFavorite = isFavorite !== null ? isFavorite :
			this.favorites.some(fav => fav.text === quote.text && fav.author === quote.author);

		if (isCurrentlyFavorite) {
			favoriteBtn.classList.add('favorited');
			favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
			favoriteBtn.title = 'Remove from Favorites';
		} else {
			favoriteBtn.classList.remove('favorited');
			favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
			favoriteBtn.title = 'Add to Favorites';
		}
	}

	updateFavoritesDisplay() {
		const favoritesGrid = document.getElementById('favorites-grid');

		if (this.favorites.length === 0) {
			favoritesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="far fa-heart"></i>
                    <h4>No favorite quotes yet</h4>
                    <p>Click the heart icon to add quotes to your favorites</p>
                </div>
            `;
			return;
		}

		favoritesGrid.innerHTML = this.favorites.map((quote, index) => `
            <div class="favorite-item">
                <div class="favorite-text">"${quote.text}"</div>
                <div class="favorite-author">— ${quote.author}</div>
                <div class="favorite-actions">
                    <button class="favorite-action-btn" onclick="quotesGenerator.shareFavorite(${index})" title="Share">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="favorite-action-btn" onclick="quotesGenerator.copyFavorite(${index})" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="favorite-action-btn" onclick="quotesGenerator.removeFavorite(${index})" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
	}

	shareFavorite(index) {
		const quote = this.favorites[index];
		this.openShareModal(quote);
	}

	copyFavorite(index) {
		const quote = this.favorites[index];
		this.copyToClipboard(`"${quote.text}" — ${quote.author}`);
		this.showToast('Quote copied to clipboard!');
	}

	removeFavorite(index) {
		this.favorites.splice(index, 1);
		this.saveFavorites();
		this.updateFavoritesDisplay();
		this.showToast('Quote removed from favorites!');
	}

	clearFavorites() {
		if (this.favorites.length === 0) return;

		if (confirm('Are you sure you want to clear all favorite quotes?')) {
			this.favorites = [];
			this.saveFavorites();
			this.updateFavoritesDisplay();
			this.updateFavoriteButton({ text: '', author: '' }, false);
			this.showToast('All favorites cleared!');
		}
	}

	saveFavorites() {
		localStorage.setItem('favoriteQuotes', JSON.stringify(this.favorites));
	}

	copyQuote() {
		const text = document.getElementById('quote-text').textContent;
		const author = document.getElementById('quote-author').textContent;
		this.copyToClipboard(`"${text}" ${author}`);
		this.showToast('Quote copied to clipboard!');
	}

	copyToClipboard(text) {
		navigator.clipboard.writeText(text).catch(() => {
			// Fallback for older browsers
			const textArea = document.createElement('textarea');
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
		});
	}

	openShareModal(quote = null) {
		const text = quote ? quote.text : document.getElementById('quote-text').textContent;
		const author = quote ? quote.author : document.getElementById('quote-author').textContent.replace('— ', '');
		const shareText = `"${text}" — ${author}`;

		document.getElementById('share-text').value = shareText;
		document.getElementById('share-modal').style.display = 'block';
	}

	closeShareModal() {
		document.getElementById('share-modal').style.display = 'none';
	}

	copyShareText() {
		const shareText = document.getElementById('share-text');
		shareText.select();
		document.execCommand('copy');
		this.showToast('Quote copied to clipboard!');
	}

	shareOnPlatform(button) {
		const platform = button.dataset.platform;
		const text = encodeURIComponent(document.getElementById('share-text').value);
		let url = '';

		switch (platform) {
			case 'twitter':
				url = `https://twitter.com/intent/tweet?text=${text}`;
				break;
			case 'facebook':
				url = `https://www.facebook.com/sharer/sharer.php?quote=${text}`;
				break;
			case 'linkedin':
				url = `https://www.linkedin.com/sharing/share-offsite/?text=${text}`;
				break;
			case 'whatsapp':
				url = `https://wa.me/?text=${text}`;
				break;
		}

		if (url) {
			window.open(url, '_blank', 'width=600,height=400');
		}
	}

	speakQuote() {
		if (this.speechSynthesis.speaking) {
			this.speechSynthesis.cancel();
			return;
		}

		const text = document.getElementById('quote-text').textContent;
		const author = document.getElementById('quote-author').textContent;
		const utterance = new SpeechSynthesisUtterance(`${text}. By ${author}`);

		utterance.rate = 0.9;
		utterance.pitch = 1;
		utterance.volume = 1;

		this.speechSynthesis.speak(utterance);

		// Update button during speech
		const speakBtn = document.getElementById('speak-btn');
		speakBtn.innerHTML = '<i class="fas fa-stop"></i>';
		speakBtn.title = 'Stop Reading';

		utterance.onend = () => {
			speakBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
			speakBtn.title = 'Read Aloud';
		};
	}

	async loadQuoteOfTheDay() {
		try {
			const response = await fetch('https://quotes.rest/qod?category=inspire');
			const data = await response.json();

			if (data.contents && data.contents.quotes) {
				const qotd = data.contents.quotes[0];
				document.getElementById('qotd-text').textContent = qotd.quote;
				document.getElementById('qotd-author').textContent = `— ${qotd.author}`;
			}
		} catch (error) {
			// Fallback QOTD
			document.getElementById('qotd-text').textContent = "The only way to do great work is to love what you do.";
			document.getElementById('qotd-author').textContent = "— Steve Jobs";
		}
	}

	showToast(message) {
		const toast = document.getElementById('toast');
		const toastMessage = document.getElementById('toast-message');

		toastMessage.textContent = message;
		toast.classList.add('show');

		setTimeout(() => {
			toast.classList.remove('show');
		}, 3000);
	}

	showLoading() {
		document.getElementById('loading').style.display = 'block';
	}

	hideLoading() {
		document.getElementById('loading').style.display = 'none';
	}
}

// Initialize quotes generator when page loads
const quotesGenerator = new QuotesGenerator();

// Back to dashboard function
function goBack() {
	window.location.href = '../index.html'; 
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .quote-card {
        animation: fadeIn 0.5s ease;
    }
`;
document.head.appendChild(style);