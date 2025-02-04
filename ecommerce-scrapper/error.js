export class CustomError extends Error {
	constructor(message, details = {}) {
		super(message);
		this.name = this.constructor.name;
		this.details = details;
		Error.captureStackTrace?.(this, this.constructor);
	}
}

export class ValidationError extends CustomError {
	constructor(message = "Validation failed", details) {
		super(message, details);
	}
}

export class NetworkError extends CustomError {
	constructor(message = "Network error occurred", details) {
		super(message, details);
	}
}

export class ScraperError extends CustomError {
	constructor(message = "Scraper encountered an error", details) {
		super(message, details);
	}
}

export class DataExtractionError extends CustomError {
	constructor(message = "Data extraction failed", details) {
		super(message, details);
	}
}