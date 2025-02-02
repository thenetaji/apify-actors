export class CustomError extends Error {
	super(message);
	constructor() {
		
	};
};

export class ValidationError extends CustomError {};

export class NetworkError extends CustomError {};

export class ScraperError extends CustomError {};

export class DataExtractionError extends CustomError {};