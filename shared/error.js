export class CustomError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class NetworkError extends CustomError {
  constructor(details) {
    super("Network error occurred", details);
  }
}

export class ScraperError extends CustomError {
  constructor(details) {
    super("Scraper encountered an error", details);
  }
}

export class DataExtractionError extends CustomError {
  constructor(details) {
    super("Data extraction failed", details);
  }
}

export class InputValidationError extends CustomError {
  constructor(details) {
    super("Input validation failed: some fields are missing or incorrect", details);
  }
}

export class DatabaseError extends CustomError {
  constructor(details) {
    super("Database operation failed", details);
  }
}

export class InitializationError extends CustomError {
  constructor(details) {
    super("Actor initialization failed", details);
  }
}

export class ProxyConfigError extends CustomError {
  constructor(details) {
    super("Proxy configuration error", details);
  }
}

export class DataProcessingError extends CustomError {
  constructor(details) {
    super("Error processing data", details);
  }
}

export class SaveFileError extends CustomError {
  constructor(details) {
    super("Failed to save file", details);
  }
}

export class InvalidURLError extends CustomError {
  constructor(details) {
    super("Invalid URL detected", details);
  }
}

export class DownloadError extends CustomError {
  constructor(details) {
    super("Download process failed", details);
  }
}